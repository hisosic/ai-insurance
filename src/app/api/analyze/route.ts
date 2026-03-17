import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { insuranceProducts } from "@/lib/insurance-products";
import { saveAnalysis } from "@/lib/db";
import { sendTelegramNotification } from "@/lib/telegram";
import {
  ExtractedMetrics,
  gradeAllMetrics,
  computeRiskScore,
  computeStatus,
  computeOverallRiskLevel,
  computeHealthScore,
  buildFindings,
} from "@/lib/health-scoring";

// ─── Gemini API 키 폴백 ───
const GEMINI_API_KEYS = [
  process.env.GEMINI_API_KEY || "",
  process.env.GEMINI_API_KEY_BACKUP || "",
].filter(Boolean);

function createGenAI(keyIndex = 0): GoogleGenerativeAI {
  return new GoogleGenerativeAI(GEMINI_API_KEYS[keyIndex] || "");
}

function getModels(genAI: GoogleGenerativeAI) {
  const config = {
    temperature: 0,
    topP: 1,
    responseMimeType: "application/json" as const,
  };
  return {
    extractionModel: genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: config,
    }),
    analysisModel: genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: config,
    }),
  };
}

// ─── 민감정보 마스킹 유틸 ───
function maskSensitiveInfo(text: string, name: string, phone: string): string {
  let masked = text;
  // 이름 마스킹
  if (name && name.length >= 2) {
    masked = masked.replaceAll(name, "***");
  }
  // 연락처 마스킹 (다양한 형식: 010-1234-5678, 01012345678, 010 1234 5678)
  if (phone) {
    const digitsOnly = phone.replace(/[^0-9]/g, "");
    if (digitsOnly.length >= 10) {
      // 원본 형식 그대로 마스킹
      masked = masked.replaceAll(phone, "***-****-****");
      // 숫자만 있는 형태도 마스킹
      masked = masked.replaceAll(digitsOnly, "***********");
      // 하이픈 포함 다른 형식도 마스킹
      const formatted = `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 7)}-${digitsOnly.slice(7)}`;
      masked = masked.replaceAll(formatted, "***-****-****");
    }
  }
  // 주민등록번호 패턴 마스킹 (XXXXXX-XXXXXXX)
  masked = masked.replace(/\d{6}\s*-\s*\d{7}/g, "******-*******");
  return masked;
}

// ─── Step 1 프롬프트: 수치만 추출 ───
const EXTRACTION_PROMPT = `당신은 건강검진 결과지에서 수치를 정확하게 추출하는 전문가입니다.

중요: 문서에 포함된 이름, 연락처, 주민등록번호, 주소 등 개인정보는 절대 추출하거나 응답에 포함하지 마세요. 오직 건강검진 수치만 추출하세요.

아래 건강검진 데이터에서 수치를 추출하여 JSON으로 응답하세요.
수치가 존재하지 않거나 읽을 수 없는 항목은 null로 표기하세요.
반드시 숫자 또는 null만 값으로 사용하세요. 단위는 포함하지 마세요.

응답 형식:
{
  "systolic": 수축기혈압(mmHg),
  "diastolic": 이완기혈압(mmHg),
  "fastingGlucose": 공복혈당(mg/dL),
  "hba1c": 당화혈색소(%),
  "totalCholesterol": 총콜레스테롤(mg/dL),
  "ldl": LDL콜레스테롤(mg/dL),
  "hdl": HDL콜레스테롤(mg/dL),
  "triglyceride": 중성지방(mg/dL),
  "ast": AST/GOT(U/L),
  "alt": ALT/GPT(U/L),
  "ggt": GGT/감마GT(U/L),
  "creatinine": 크레아티닌(mg/dL),
  "egfr": 사구체여과율(mL/min),
  "bun": BUN/요소질소(mg/dL),
  "bmi": 체질량지수,
  "hemoglobin": 헤모글로빈(g/dL),
  "wbc": 백혈구(10^3/uL),
  "platelet": 혈소판(10^3/uL),
  "uricAcid": 요산(mg/dL)
}`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("textInput") as string | null;
    const name = formData.get("name") as string;
    const age = formData.get("age") as string;
    const gender = formData.get("gender") as string;
    const phone = formData.get("phone") as string;

    if (!file && !textInput?.trim()) {
      return NextResponse.json(
        { error: "파일 또는 텍스트 입력이 필요합니다" },
        { status: 400 }
      );
    }

    let base64 = "";
    let mimeType = "";

    if (file) {
      const bytes = await file.arrayBuffer();
      base64 = Buffer.from(bytes).toString("base64");
      const isPdf = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");
      mimeType = file.type;

      if (!isPdf && !isImage) {
        return NextResponse.json(
          { error: "PDF 또는 이미지 파일만 지원합니다" },
          { status: 400 }
        );
      }
    }

    // ─── Gemini API 키 폴백으로 모델 생성 ───
    let lastError: Error | null = null;
    for (let keyIdx = 0; keyIdx < GEMINI_API_KEYS.length; keyIdx++) {
      try {
        const genAI = createGenAI(keyIdx);
        const { extractionModel, analysisModel } = getModels(genAI);
        const result = await runAnalysis(
          extractionModel, analysisModel,
          { file, base64, mimeType, textInput, name, age, gender, phone }
        );
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Gemini API key #${keyIdx + 1} failed:`, lastError.message);
        if (keyIdx < GEMINI_API_KEYS.length - 1) {
          console.log(`Retrying with backup key #${keyIdx + 2}...`);
        }
      }
    }
    throw lastError || new Error("모든 API 키가 실패했습니다");
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "분석 중 오류가 발생했습니다";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── 분석 실행 함수 ───
async function runAnalysis(
  extractionModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  analysisModel: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  input: {
    file: File | null; base64: string; mimeType: string;
    textInput: string | null; name: string; age: string; gender: string; phone: string;
  }
) {
    const { file, base64, mimeType, textInput, name, age, gender, phone } = input;

    // ═══════════════════════════════════════════
    // STEP 1: 수치 추출 (결정적)
    // ═══════════════════════════════════════════
    const extractionParts: Parameters<typeof extractionModel.generateContent>[0] =
      [];

    if (file && base64) {
      extractionParts.push({
        inlineData: { mimeType, data: base64 },
      });
    }

    // 텍스트 입력에서 민감정보 마스킹
    const maskedTextInput = textInput?.trim()
      ? maskSensitiveInfo(textInput.trim(), name, phone)
      : null;

    const extractionInput = maskedTextInput
      ? `${EXTRACTION_PROMPT}\n\n## 건강검진 데이터\n${maskedTextInput}`
      : EXTRACTION_PROMPT;
    extractionParts.push(extractionInput);

    const extractionResult = await extractionModel.generateContent(extractionParts);
    let extractedText = extractionResult.response.text().trim();
    if (extractedText.startsWith("```")) {
      extractedText = extractedText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }
    const metrics: ExtractedMetrics = JSON.parse(extractedText);

    // ═══════════════════════════════════════════
    // STEP 2: 코드 기반 결정적 점수 산정
    // ═══════════════════════════════════════════
    const gradesByCategory = gradeAllMetrics(metrics, gender);

    const categories = Object.entries(gradesByCategory).map(
      ([categoryName, grades]) => {
        const riskScore = computeRiskScore(grades);
        return {
          name: categoryName,
          riskScore,
          status: computeStatus(riskScore),
          findings: buildFindings(grades),
          details: "", // Step 3에서 채움
        };
      }
    );

    const allScores = categories.map((c) => c.riskScore);
    const overallRiskLevel = computeOverallRiskLevel(allScores);
    const healthScore = computeHealthScore(allScores);

    // ═══════════════════════════════════════════
    // STEP 3: AI 소견 생성 (점수는 고정, 텍스트만 생성)
    // ═══════════════════════════════════════════
    const productSummary = insuranceProducts
      .map(
        (p) =>
          `[${p.id}] ${p.company} - ${p.name} (${p.category}): ${p.description}. 대상: ${p.targetConditions.join(", ")}`
      )
      .join("\n");

    const scoredData = categories.map((c) => ({
      name: c.name,
      riskScore: c.riskScore,
      status: c.status,
      findings: c.findings,
    }));

    const analysisPrompt = `당신은 건강검진 분석 전문가입니다. 아래에 이미 산정된 점수와 수치 판정 결과가 있습니다.
당신의 역할은 이 데이터를 바탕으로 소견 텍스트만 작성하는 것입니다.
점수나 판정을 변경하지 마세요. 주어진 데이터에 근거한 설명만 작성하세요.

## 환자 정보
- 나이: ${age}세, 성별: ${gender}

## 추출된 수치
${JSON.stringify(metrics, null, 2)}

## 산정된 카테고리별 점수 및 판정 (변경 불가)
${JSON.stringify(scoredData, null, 2)}

## 종합 위험도: ${overallRiskLevel}

## 보험상품 목록
${productSummary}

## 응답 형식 (반드시 아래 JSON으로만 응답)
{
  "summary": "전체 건강 상태 요약 (2~3문장, 주요 이상 수치를 구체적으로 언급)",
  "categoryDetails": {
    "카테고리명": "해당 카테고리의 상세 분석 소견 (수치 근거 포함, 2~3문장)"
  },
  "topRisks": [
    {
      "condition": "질병명",
      "probability": "높음 또는 중간 또는 낮음",
      "explanation": "riskScore가 높은 카테고리의 이상 수치에 근거한 설명",
      "preventionTips": ["구체적 예방 수칙1", "예방 수칙2"]
    }
  ],
  "recommendations": {
    "lifestyle": ["생활습관 개선 사항"],
    "followUp": ["추가 검사/진료 권고"],
    "urgentActions": ["긴급 조치 (riskScore 8 이상인 카테고리가 있을 때만)"]
  },
  "insuranceRecommendations": [
    {
      "productId": "상품ID",
      "priority": 1,
      "reason": "검진 수치와 연결한 추천 사유"
    }
  ]
}

## 규칙
1. topRisks는 riskScore가 5 이상인 카테고리와 관련된 질병을 우선 선정. 3~5개.
2. probability는 다음 기준: 해당 카테고리 riskScore 7이상="높음", 5~6="중간", 3~4="낮음"
3. insuranceRecommendations는 riskScore가 높은 카테고리에 대응하는 상품 2~4개. productId는 반드시 위 목록의 ID 사용.
4. urgentActions는 riskScore 8 이상인 카테고리가 없으면 빈 배열 [].
5. summary에는 반드시 가장 높은 riskScore의 카테고리와 해당 이상 수치를 언급.`;

    const analysisResult = await analysisModel.generateContent(analysisPrompt);
    let analysisText = analysisResult.response.text().trim();
    if (analysisText.startsWith("```")) {
      analysisText = analysisText
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "");
    }
    const aiSogyeon = JSON.parse(analysisText);

    // ═══════════════════════════════════════════
    // STEP 4: 최종 결과 조립 (코드 산정 점수 + AI 소견)
    // ═══════════════════════════════════════════
    const finalCategories = categories.map((c) => ({
      ...c,
      details:
        aiSogyeon.categoryDetails?.[c.name] ||
        `${c.name} 영역의 검사 결과입니다.`,
    }));

    const analysis = {
      summary: aiSogyeon.summary || "",
      overallRiskLevel,
      healthScore,
      categories: finalCategories,
      topRisks: aiSogyeon.topRisks || [],
      recommendations: aiSogyeon.recommendations || {
        lifestyle: [],
        followUp: [],
        urgentActions: [],
      },
      insuranceRecommendations: (aiSogyeon.insuranceRecommendations || []).map(
        (rec: { productId: string; priority: number; reason: string }) => {
          const product = insuranceProducts.find((p) => p.id === rec.productId);
          return { ...rec, product: product || null };
        }
      ),
      extractedMetrics: metrics,
    };

    // Save to DB
    const { id: recordId, shareToken } = saveAnalysis({ name, age, gender, phone }, analysis);

    // Telegram 알림 (비동기, 실패해도 응답에 영향 없음)
    sendTelegramNotification({
      name, age, gender, phone,
      overallRiskLevel,
      healthScore,
      summary: analysis.summary,
      recordId,
    });

    return NextResponse.json({
      success: true,
      analysis,
      userInfo: { name, age, gender, phone },
      recordId,
      shareToken,
    });
}
