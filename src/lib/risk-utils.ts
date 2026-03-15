export function getRiskColor(score: number) {
  if (score <= 3) return "text-green-600 bg-green-50 border-green-200";
  if (score <= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (score <= 7) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

export function getRiskBarColor(score: number) {
  if (score <= 3) return "bg-green-500";
  if (score <= 5) return "bg-yellow-500";
  if (score <= 7) return "bg-orange-500";
  return "bg-red-500";
}

export function getOverallRiskStyle(level: string) {
  switch (level) {
    case "low":
      return { bg: "bg-green-100", text: "text-green-800", label: "양호", border: "border-green-300" };
    case "moderate":
      return { bg: "bg-yellow-100", text: "text-yellow-800", label: "주의", border: "border-yellow-300" };
    case "high":
      return { bg: "bg-orange-100", text: "text-orange-800", label: "경고", border: "border-orange-300" };
    case "critical":
      return { bg: "bg-red-100", text: "text-red-800", label: "위험", border: "border-red-300" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800", label: "미정", border: "border-gray-300" };
  }
}

export function getProbabilityBadge(prob: string) {
  switch (prob) {
    case "높음":
      return "bg-red-100 text-red-700 border-red-200";
    case "중간":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-green-100 text-green-700 border-green-200";
  }
}

export const KAKAO_CONSULT_URL = "https://open.kakao.com/o/sxmmuyrg";
