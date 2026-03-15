export interface InsuranceProduct {
  id: string;
  company: "한화생명" | "한화손해보험";
  name: string;
  category: string;
  description: string;
  coverageHighlights: string[];
  targetConditions: string[];
  monthlyPremiumRange: string;
}

export const insuranceProducts: InsuranceProduct[] = [
  // 한화생명 상품
  {
    id: "hl-001",
    company: "한화생명",
    name: "한화생명 건강플러스보험",
    category: "종합건강",
    description: "주요 질병과 수술을 종합적으로 보장하는 건강보험",
    coverageHighlights: [
      "암 진단금 최대 5,000만원",
      "뇌혈관질환 진단금 3,000만원",
      "심장질환 진단금 3,000만원",
      "주요 수술비 보장",
    ],
    targetConditions: ["암", "뇌혈관질환", "심장질환", "종합건강"],
    monthlyPremiumRange: "3만원 ~ 8만원",
  },
  {
    id: "hl-002",
    company: "한화생명",
    name: "한화생명 암케어보험",
    category: "암보험",
    description: "암 진단부터 치료, 회복까지 집중 보장하는 암 전문 보험",
    coverageHighlights: [
      "일반암 진단금 최대 1억원",
      "고액암 추가 진단금",
      "항암치료비 보장",
      "암 수술비 및 입원비 보장",
      "재진단암 보장",
    ],
    targetConditions: ["암", "종양", "간암", "폐암", "위암", "대장암", "유방암", "자궁경부암"],
    monthlyPremiumRange: "2만원 ~ 6만원",
  },
  {
    id: "hl-003",
    company: "한화생명",
    name: "한화생명 뇌심장질환보험",
    category: "뇌심장",
    description: "뇌혈관 및 심장질환을 집중 보장하는 보험",
    coverageHighlights: [
      "뇌출혈 진단금 5,000만원",
      "뇌경색 진단금 3,000만원",
      "급성심근경색 진단금 5,000만원",
      "심장수술비 보장",
      "뇌혈관수술비 보장",
    ],
    targetConditions: ["뇌혈관", "심장", "고혈압", "부정맥", "동맥경화", "뇌졸중", "심근경색"],
    monthlyPremiumRange: "2만원 ~ 5만원",
  },
  {
    id: "hl-004",
    company: "한화생명",
    name: "한화생명 간병보험",
    category: "간병/치매",
    description: "치매, 장기요양 상태를 보장하는 간병보험",
    coverageHighlights: [
      "치매 진단금 3,000만원",
      "장기요양 등급 인정시 보장",
      "간병비 월 100만원",
      "경도인지장애 보장",
    ],
    targetConditions: ["치매", "인지기능", "뇌", "노화", "신경계"],
    monthlyPremiumRange: "3만원 ~ 7만원",
  },
  {
    id: "hl-005",
    company: "한화생명",
    name: "한화생명 당뇨케어보험",
    category: "대사질환",
    description: "당뇨병 및 합병증을 보장하는 특화 보험",
    coverageHighlights: [
      "당뇨 합병증 진단금",
      "당뇨성 신장질환 보장",
      "당뇨성 망막질환 보장",
      "인슐린 치료비 보장",
    ],
    targetConditions: ["당뇨", "혈당", "대사증후군", "인슐린", "HbA1c"],
    monthlyPremiumRange: "2만원 ~ 4만원",
  },
  // 한화손해보험 상품
  {
    id: "hg-001",
    company: "한화손해보험",
    name: "한화손해보험 실손의료비보험",
    category: "실손보험",
    description: "실제 치료비를 보장하는 의료비 실손보험",
    coverageHighlights: [
      "입원 의료비 보장 (급여 80%, 비급여 70%)",
      "통원 의료비 보장",
      "처방조제비 보장",
      "MRI, CT 등 고가 검사비 보장",
    ],
    targetConditions: ["종합건강", "입원", "수술", "통원치료", "의료비"],
    monthlyPremiumRange: "1만원 ~ 3만원",
  },
  {
    id: "hg-002",
    company: "한화손해보험",
    name: "한화손해보험 간편건강보험",
    category: "간편가입",
    description: "간편한 심사로 가입 가능한 건강보험 (유병자도 가입 가능)",
    coverageHighlights: [
      "3가지 간편 심사",
      "암 진단금 보장",
      "뇌심장질환 보장",
      "유병자 가입 가능",
    ],
    targetConditions: ["기존질환", "유병자", "고혈압", "당뇨", "종합건강"],
    monthlyPremiumRange: "3만원 ~ 8만원",
  },
  {
    id: "hg-003",
    company: "한화손해보험",
    name: "한화손해보험 간/신장질환보험",
    category: "간/신장",
    description: "간질환 및 신장질환을 집중 보장하는 보험",
    coverageHighlights: [
      "간경화 진단금",
      "간암 추가 보장",
      "만성신부전 진단금",
      "투석치료비 보장",
      "간/신장 이식수술비",
    ],
    targetConditions: ["간", "신장", "간경화", "지방간", "만성신부전", "크레아티닌", "AST", "ALT", "GGT"],
    monthlyPremiumRange: "2만원 ~ 5만원",
  },
  {
    id: "hg-004",
    company: "한화손해보험",
    name: "한화손해보험 호흡기질환보험",
    category: "호흡기",
    description: "폐 및 호흡기 질환을 보장하는 보험",
    coverageHighlights: [
      "폐암 진단금 보장",
      "만성폐쇄성폐질환(COPD) 보장",
      "폐렴 입원비 보장",
      "호흡기 수술비 보장",
    ],
    targetConditions: ["폐", "호흡기", "COPD", "폐기능", "흉부", "기관지"],
    monthlyPremiumRange: "2만원 ~ 4만원",
  },
  {
    id: "hg-005",
    company: "한화손해보험",
    name: "한화손해보험 근골격케어보험",
    category: "근골격",
    description: "관절, 척추 등 근골격 질환을 보장하는 보험",
    coverageHighlights: [
      "관절질환 수술비",
      "척추질환 수술비",
      "골절 진단금",
      "깁스치료비 보장",
      "통원물리치료비",
    ],
    targetConditions: ["관절", "척추", "골다공증", "골밀도", "근골격", "디스크"],
    monthlyPremiumRange: "2만원 ~ 4만원",
  },
  {
    id: "hg-006",
    company: "한화손해보험",
    name: "한화손해보험 여성질환보험",
    category: "여성질환",
    description: "여성 특유의 질환을 전문적으로 보장하는 보험",
    coverageHighlights: [
      "유방암 진단금",
      "자궁경부암 진단금",
      "난소암 진단금",
      "여성 생식기 질환 수술비",
      "임신/출산 합병증 보장",
    ],
    targetConditions: ["유방", "자궁", "난소", "여성질환", "부인과"],
    monthlyPremiumRange: "2만원 ~ 5만원",
  },
];
