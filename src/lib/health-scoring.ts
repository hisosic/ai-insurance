/**
 * 코드 기반 결정적 건강 점수 산정 모듈
 * AI의 주관적 판단 대신 규칙 기반으로 점수를 산정하여 일관성을 보장합니다.
 */

export interface ExtractedMetrics {
  // 혈압
  systolic?: number; // 수축기
  diastolic?: number; // 이완기
  // 혈당/대사
  fastingGlucose?: number; // 공복혈당
  hba1c?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglyceride?: number;
  // 간기능
  ast?: number;
  alt?: number;
  ggt?: number;
  // 신장기능
  creatinine?: number;
  egfr?: number;
  bun?: number;
  // 체성분
  bmi?: number;
  // 혈액
  hemoglobin?: number;
  wbc?: number;
  platelet?: number;
  // 기타
  uricAcid?: number;
}

type Grade = "normal" | "borderline" | "abnormal";

interface GradeResult {
  grade: Grade;
  value: number;
  label: string;
  ref: string;
}

function gradeMetric(
  value: number | undefined,
  label: string,
  normalRange: [number, number],
  borderlineRange: [number, number],
  ref: string,
  invertDirection?: boolean
): GradeResult | null {
  if (value === undefined || value === null) return null;
  let grade: Grade;
  if (invertDirection) {
    // 낮을수록 위험 (HDL, eGFR 등)
    if (value >= normalRange[0]) grade = "normal";
    else if (value >= borderlineRange[0]) grade = "borderline";
    else grade = "abnormal";
  } else {
    // 높을수록 위험
    if (value <= normalRange[1]) grade = "normal";
    else if (value <= borderlineRange[1]) grade = "borderline";
    else grade = "abnormal";
  }
  return { grade, value, label, ref };
}

export function gradeAllMetrics(
  m: ExtractedMetrics,
  gender: string
): Record<string, GradeResult[]> {
  const isMale = gender === "남성";

  // 보수적 기준: 정상 범위를 좁히고, 경계→이상 기준도 더 엄격하게 설정
  const cardiovascular: (GradeResult | null)[] = [
    gradeMetric(m.systolic, "수축기혈압", [0, 114], [0, 129], "정상 <115, 경계 115~129, 고혈압전단계/고혈압 >=130"),
    gradeMetric(m.diastolic, "이완기혈압", [0, 74], [0, 84], "정상 <75, 경계 75~84, 고혈압전단계/고혈압 >=85"),
    gradeMetric(m.totalCholesterol, "총콜레스테롤", [0, 189], [0, 219], "정상 <190, 경계 190~219, 높음 >=220 mg/dL"),
    gradeMetric(m.ldl, "LDL", [0, 119], [0, 139], "정상 <120, 경계 120~139, 높음 >=140 mg/dL"),
    gradeMetric(
      m.hdl,
      "HDL",
      [isMale ? 45 : 55, 999],
      [isMale ? 40 : 45, 999],
      isMale ? "남성 정상 >=45 mg/dL" : "여성 정상 >=55 mg/dL",
      true
    ),
    gradeMetric(m.triglyceride, "중성지방", [0, 129], [0, 169], "정상 <130, 경계 130~169, 높음 >=170 mg/dL"),
  ];

  const liver: (GradeResult | null)[] = [
    gradeMetric(m.ast, "AST(GOT)", [0, 33], [0, 50], "정상 0~33 U/L"),
    gradeMetric(m.alt, "ALT(GPT)", [0, 30], [0, 50], "정상 0~30 U/L"),
    gradeMetric(
      m.ggt,
      "GGT",
      [0, isMale ? 50 : 30],
      [0, isMale ? 80 : 50],
      isMale ? "남성 정상 <=50 U/L" : "여성 정상 <=30 U/L"
    ),
  ];

  const kidney: (GradeResult | null)[] = [
    gradeMetric(
      m.creatinine,
      "크레아티닌",
      [0, isMale ? 1.2 : 1.0],
      [0, isMale ? 1.5 : 1.2],
      isMale ? "남성 정상 0.7~1.2 mg/dL" : "여성 정상 0.6~1.0 mg/dL"
    ),
    gradeMetric(m.egfr, "eGFR", [90, 999], [60, 999], "정상 >=90, 경도저하 60~89, 중등도저하 <60 mL/min", true),
    gradeMetric(m.bun, "BUN", [0, 19], [0, 23], "정상 7~19 mg/dL"),
  ];

  const metabolic: (GradeResult | null)[] = [
    gradeMetric(m.fastingGlucose, "공복혈당", [0, 94], [0, 109], "정상 <95, 경계 95~109, 당뇨전단계/당뇨 >=110 mg/dL"),
    gradeMetric(m.hba1c, "HbA1c", [0, 5.4], [0, 5.9], "정상 <5.5, 경계 5.5~5.9, 당뇨전단계/당뇨 >=6.0%"),
    gradeMetric(m.uricAcid, "요산", [0, isMale ? 6.5 : 5.5], [0, isMale ? 7.5 : 6.5], isMale ? "남성 정상 3.4~6.5 mg/dL" : "여성 정상 2.4~5.5 mg/dL"),
  ];

  const body: (GradeResult | null)[] = [
    gradeMetric(m.bmi, "BMI", [0, 22.4], [0, 24.4], "정상 18.5~22.4, 과체중 22.5~24.4, 비만 >=24.5"),
  ];

  const filterNull = (arr: (GradeResult | null)[]): GradeResult[] =>
    arr.filter((v): v is GradeResult => v !== null);

  return {
    심혈관계: filterNull(cardiovascular),
    간기능: filterNull(liver),
    신장기능: filterNull(kidney),
    "대사기능(혈당/지질)": filterNull(metabolic),
    "체성분(BMI)": filterNull(body),
  };
}

export function computeRiskScore(grades: GradeResult[]): number {
  if (grades.length === 0) return -1; // 수치 없음 → 판정 불가

  const abnormalCount = grades.filter((g) => g.grade === "abnormal").length;
  const borderlineCount = grades.filter((g) => g.grade === "borderline").length;
  const total = grades.length;
  const abnormalRatio = abnormalCount / total;

  // 보수적 산정: 경계도 위험 신호로 간주, 이상은 더 높은 점수 부여
  if (abnormalCount === 0 && borderlineCount === 0) return 2;
  if (abnormalCount === 0 && borderlineCount === 1) return 4;
  if (abnormalCount === 0 && borderlineCount >= 2) return 5;
  if (abnormalCount === 1 && borderlineCount === 0) return 6;
  if (abnormalCount === 1 && borderlineCount >= 1) return 7;
  if (abnormalCount >= 2 && abnormalRatio < 0.5) return 8;
  if (abnormalCount >= 2 && abnormalRatio < 0.7) return 9;
  return 10;
}

export function computeStatus(score: number): string {
  if (score < 0) return "판정불가";
  if (score <= 2) return "정상";
  if (score <= 4) return "경계";
  if (score <= 6) return "주의";
  return "위험";
}

export function computeOverallRiskLevel(scores: number[]): string {
  // 판정 가능한 카테고리만 필터
  const validScores = scores.filter((s) => s >= 0);
  if (validScores.length === 0) return "unknown";

  const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
  const max = Math.max(...validScores);

  // 보수적: 하나라도 높으면 전체 등급 상향
  if (max >= 9) return "critical";
  if (max >= 7 || avg > 5) return "high";
  if (max >= 5 || avg > 3) return "moderate";
  return "low";
}

/**
 * 100점 만점 건강 점수 계산
 * 각 카테고리의 riskScore(1~10)를 기반으로 역산
 * riskScore가 낮을수록 건강 점수가 높음
 */
export function computeHealthScore(categoryScores: number[]): number {
  // 판정 가능한 카테고리만 필터
  const validScores = categoryScores.filter((s) => s >= 0);
  if (validScores.length === 0) return -1; // 수치 부족 → 판정 불가

  // 각 카테고리별 점수: (10 - riskScore) / 10 * 100 → 카테고리당 0~100점
  const categoryHealthScores = validScores.map((rs) =>
    Math.max(0, Math.round(((10 - rs) / 8) * 100))
  );

  // 가중 평균 (70%) + 최저 카테고리 (30%)
  const avg =
    categoryHealthScores.reduce((a, b) => a + b, 0) /
    categoryHealthScores.length;
  const min = Math.min(...categoryHealthScores);
  const raw = avg * 0.7 + min * 0.3;

  // 0~100 범위로 클램프
  return Math.max(0, Math.min(100, Math.round(raw)));
}

// 추출된 수치의 유효성 검증 (비정상적 범위 필터링)
const METRIC_BOUNDS: Record<string, [number, number]> = {
  systolic: [50, 300],
  diastolic: [20, 200],
  fastingGlucose: [20, 700],
  hba1c: [2, 20],
  totalCholesterol: [50, 500],
  ldl: [10, 400],
  hdl: [5, 150],
  triglyceride: [10, 2000],
  ast: [1, 2000],
  alt: [1, 2000],
  ggt: [1, 3000],
  creatinine: [0.1, 30],
  egfr: [1, 200],
  bun: [1, 150],
  bmi: [10, 60],
  hemoglobin: [2, 25],
  wbc: [0.5, 50],
  platelet: [10, 1000],
  uricAcid: [0.5, 20],
};

export function sanitizeMetrics(m: ExtractedMetrics): ExtractedMetrics {
  const sanitized: ExtractedMetrics = {};
  for (const [key, value] of Object.entries(m)) {
    if (value === null || value === undefined) continue;
    if (typeof value !== "number" || isNaN(value)) continue;
    const bounds = METRIC_BOUNDS[key];
    if (bounds && (value < bounds[0] || value > bounds[1])) continue; // 범위 밖 → 제외
    (sanitized as Record<string, number>)[key] = value;
  }
  return sanitized;
}

export function countValidMetrics(m: ExtractedMetrics): number {
  return Object.values(m).filter(
    (v) => v !== null && v !== undefined && typeof v === "number" && !isNaN(v)
  ).length;
}

export const MIN_REQUIRED_METRICS = 3;

export function buildFindings(grades: GradeResult[]): string[] {
  return grades.map((g) => {
    const statusLabel =
      g.grade === "normal" ? "정상" : g.grade === "borderline" ? "경계" : "이상";
    return `${g.label} ${g.value} (${g.ref}) → ${statusLabel}`;
  });
}
