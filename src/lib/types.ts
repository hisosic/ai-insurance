export interface AnalysisCategory {
  name: string;
  riskScore: number;
  status: string;
  findings: string[];
  details: string;
}

export interface TopRisk {
  condition: string;
  probability: string;
  explanation: string;
  preventionTips: string[];
}

export interface InsuranceRecommendation {
  productId: string;
  priority: number;
  reason: string;
  product?: {
    id: string;
    company: string;
    name: string;
    category: string;
    description: string;
    coverageHighlights: string[];
    monthlyPremiumRange: string;
  };
}

export interface AnalysisResult {
  summary: string;
  overallRiskLevel: string;
  categories: AnalysisCategory[];
  topRisks: TopRisk[];
  recommendations: {
    lifestyle: string[];
    followUp: string[];
    urgentActions: string[];
  };
  insuranceRecommendations: InsuranceRecommendation[];
}
