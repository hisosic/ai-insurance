import type { AnalysisResult } from "./types";

export const SAMPLE_RESULT: AnalysisResult = {
  summary:
    "전반적으로 대사증후군 초기 징후가 관찰됩니다. 혈당과 콜레스테롤 수치가 경계 범위에 있으며, 간 기능 수치가 다소 상승되어 있습니다. 즉각적인 위험은 낮으나, 생활습관 개선과 정기적인 추적 관찰이 필요합니다.",
  overallRiskLevel: "moderate",
  categories: [
    {
      name: "심혈관계",
      riskScore: 5,
      status: "주의",
      findings: [
        "혈압 130/85 mmHg (경계 고혈압)",
        "총콜레스테롤 220 mg/dL (경계 수준)",
        "LDL 콜레스테롤 150 mg/dL (경계 상승)",
      ],
      details:
        "혈압과 콜레스테롤이 정상 상한선에 위치해 있습니다. 현재 즉각적인 치료가 필요한 수준은 아니지만, 6개월 내 재검사와 함께 저염식·유산소 운동 등 생활습관 교정이 권장됩니다.",
    },
    {
      name: "간 기능",
      riskScore: 6,
      status: "주의",
      findings: [
        "AST(GOT) 35 U/L (정상 범위 상단)",
        "ALT(GPT) 52 U/L (경도 상승)",
        "GGT 78 U/L (상승)",
      ],
      details:
        "ALT와 GGT 수치가 정상 범위를 초과하여 지방간 또는 알코올성 간질환 가능성이 있습니다. 음주 습관 점검과 함께 복부 초음파 검사를 권장합니다.",
    },
    {
      name: "당뇨/대사",
      riskScore: 5,
      status: "주의",
      findings: [
        "공복혈당 112 mg/dL (공복혈당장애)",
        "HbA1c 6.0% (당뇨 전단계 경계)",
        "중성지방 195 mg/dL (경계 상승)",
      ],
      details:
        "공복혈당과 HbA1c가 당뇨 전단계 경계에 위치합니다. 식이요법과 규칙적인 운동으로 혈당 조절이 가능한 단계이며, 3~6개월 후 재검사가 필요합니다.",
    },
    {
      name: "신장 기능",
      riskScore: 2,
      status: "양호",
      findings: [
        "크레아티닌 0.9 mg/dL (정상)",
        "사구체여과율(eGFR) 95 mL/min (정상)",
      ],
      details:
        "신장 기능은 정상 범위 내에 있으며, 현재 특별한 이상 소견은 없습니다.",
    },
    {
      name: "갑상선",
      riskScore: 1,
      status: "정상",
      findings: ["TSH 2.1 mIU/L (정상)", "Free T4 1.2 ng/dL (정상)"],
      details: "갑상선 기능은 모두 정상 범위입니다.",
    },
    {
      name: "체성분/비만",
      riskScore: 4,
      status: "주의",
      findings: [
        "BMI 26.8 (과체중)",
        "허리둘레 88 cm (복부비만 경계)",
        "체지방률 28% (경계)",
      ],
      details:
        "BMI와 허리둘레가 과체중·복부비만 경계에 해당합니다. 체중 감량(3~5kg)과 복부 지방 감소를 위한 유산소 운동이 권장됩니다.",
    },
  ],
  topRisks: [
    {
      condition: "대사증후군",
      probability: "중간",
      explanation:
        "혈압, 혈당, 중성지방, 허리둘레 등 여러 지표가 경계 수준에 있어 대사증후군 진단 기준에 근접해 있습니다. 5가지 기준 중 2~3가지 해당 시 대사증후군으로 진단됩니다.",
      preventionTips: [
        "주 5회 이상 30분 중강도 유산소 운동",
        "정제 탄수화물·당류 섭취 줄이기",
        "체중 5~7% 감량 목표 설정",
      ],
    },
    {
      condition: "비알코올성 지방간",
      probability: "중간",
      explanation:
        "ALT, GGT 수치 상승과 과체중·복부비만 소견이 지방간 가능성을 시사합니다. 방치 시 간섬유화로 진행할 수 있습니다.",
      preventionTips: [
        "음주량 줄이기 (주 2회 이하)",
        "과당·정제당 섭취 제한",
        "복부 초음파 정밀검사 시행",
      ],
    },
    {
      condition: "제2형 당뇨",
      probability: "낮음-중간",
      explanation:
        "공복혈당장애와 HbA1c 경계 수치가 향후 당뇨 발병 위험을 높입니다. 현재는 생활습관 교정만으로 충분히 예방 가능한 단계입니다.",
      preventionTips: [
        "규칙적인 식사 시간 유지",
        "통곡물·채소 위주 식이 전환",
        "3~6개월 간격 혈당 모니터링",
      ],
    },
  ],
  recommendations: {
    urgentActions: [
      "복부 초음파 검사를 통한 지방간 여부 확인 (1개월 내)",
      "내과 전문의 상담 - 대사증후군 종합 평가",
    ],
    followUp: [
      "3개월 후 혈당·지질 재검사",
      "6개월 후 간기능 수치 추적 검사",
      "연 1회 종합 건강검진 지속",
    ],
    lifestyle: [
      "주 5회 30분 이상 유산소 운동 (걷기, 수영, 자전거)",
      "저염·저당 식이 - 나트륨 2,000mg/일 이하",
      "체중 3~5kg 감량 목표 (3개월)",
      "음주 절제 (주 2회 이하, 회당 소주 2잔 이하)",
      "충분한 수면 (7~8시간) 및 스트레스 관리",
    ],
  },
  insuranceRecommendations: [
    {
      productId: "sample-1",
      priority: 1,
      reason:
        "대사증후군 경계 수치와 간 기능 이상 소견으로, 향후 만성질환 발병 시 고액 치료비에 대비할 수 있는 종합건강보험이 최우선 권장됩니다.",
      product: {
        id: "sample-1",
        company: "삼성생명",
        name: "건강플러스 종합보험",
        category: "종합건강보험",
        description: "3대 질환(암·심장·뇌혈관) 집중 보장 및 생활습관병 특약",
        coverageHighlights: [
          "암 진단금 최대 5,000만원",
          "심혈관·뇌혈관질환 수술비 보장",
          "당뇨·고혈압 합병증 입원비 보장",
          "건강관리 서비스 제공",
        ],
        monthlyPremiumRange: "5만원 ~ 12만원",
      },
    },
    {
      productId: "sample-2",
      priority: 2,
      reason:
        "간 기능 수치 이상으로 향후 간질환 진행 가능성에 대비하여 실손의료보험 가입이 권장됩니다.",
      product: {
        id: "sample-2",
        company: "한화생명",
        name: "실손의료보험 플러스",
        category: "실손의료보험",
        description: "입원·통원 의료비 실비 보장",
        coverageHighlights: [
          "입원 의료비 5,000만원 한도",
          "통원 의료비 30만원 한도",
          "처방 조제비 10만원 한도",
        ],
        monthlyPremiumRange: "3만원 ~ 7만원",
      },
    },
    {
      productId: "sample-3",
      priority: 3,
      reason:
        "대사증후군 위험군으로 향후 당뇨·심혈관 질환 가능성이 있어, 진단비 중심 특약이 유용합니다.",
      product: {
        id: "sample-3",
        company: "교보생명",
        name: "건강백세 진단보험",
        category: "진단보험",
        description: "주요 질환 진단 시 목돈 지급",
        coverageHighlights: [
          "당뇨병 진단금 500만원",
          "뇌혈관질환 진단금 1,000만원",
          "허혈성심장질환 진단금 1,000만원",
        ],
        monthlyPremiumRange: "2만원 ~ 5만원",
      },
    },
  ],
};
