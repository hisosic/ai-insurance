"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  ChevronRight,
  Loader2,
  MessageCircle,
  ExternalLink,
  Heart,
} from "lucide-react";

interface AnalysisCategory {
  name: string;
  riskScore: number;
  status: string;
  findings: string[];
  details: string;
}

interface TopRisk {
  condition: string;
  probability: string;
  explanation: string;
  preventionTips: string[];
}

interface InsuranceRecommendation {
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

interface AnalysisResult {
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

interface RecordData {
  id: number;
  name: string;
  age: number;
  gender: string;
  overall_risk_level: string;
  summary: string;
  analysis_json: string;
  created_at: string;
}

const KAKAO_CONSULT_URL = "https://open.kakao.com/o/sxmmuyrg";

export default function ResultPage() {
  const params = useParams();
  const [record, setRecord] = useState<RecordData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.token) return;
    fetch(`/api/results/${params.token}`)
      .then((res) => {
        if (!res.ok) throw new Error("결과를 찾을 수 없습니다");
        return res.json();
      })
      .then((data) => {
        setRecord(data);
        setResult(JSON.parse(data.analysis_json));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  const getRiskColor = (score: number) => {
    if (score <= 3) return "text-green-600 bg-green-50 border-green-200";
    if (score <= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score <= 7) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRiskBarColor = (score: number) => {
    if (score <= 3) return "bg-green-500";
    if (score <= 5) return "bg-yellow-500";
    if (score <= 7) return "bg-orange-500";
    return "bg-red-500";
  };

  const getOverallRiskStyle = (level: string) => {
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
  };

  const getProbabilityBadge = (prob: string) => {
    switch (prob) {
      case "높음":
        return "bg-red-100 text-red-700 border-red-200";
      case "중간":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">분석 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !result || !record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium mb-2">결과를 찾을 수 없습니다</p>
          <p className="text-sm text-gray-400 mb-6">삭제되었거나 잘못된 링크입니다.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
          >
            <Activity className="w-4 h-4" />
            나도 무료 분석 받기
          </Link>
        </div>
      </div>
    );
  }

  const riskStyle = getOverallRiskStyle(result.overallRiskLevel);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">건강검진 AI 분석</h1>
              <p className="text-xs text-gray-500">AI 건강분석 및 보험 정보 서비스</p>
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition font-medium"
          >
            <Activity className="w-4 h-4" />
            나도 분석 받기
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Shared Result Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">{record.name}</span>님({record.age}세, {record.gender})의 건강검진 AI 분석 결과입니다.
            <span className="text-blue-600 ml-1">({record.created_at} 분석)</span>
          </p>
        </div>

        {/* Medical Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            아래 분석 결과는 AI가 생성한 <span className="font-semibold">참고용 정보</span>입니다.
            의학적 진단이나 치료를 대체하지 않으며, 정확한 건강 상태 확인은 반드시 의료기관 전문의와 상담하시기 바랍니다.
          </p>
        </div>

        {/* Overall Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">종합 건강 분석 결과</h2>
              <p className="text-gray-600 leading-relaxed">{result.summary}</p>
            </div>
            <div className={`ml-4 px-4 py-2 rounded-xl border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
              <p className="text-xs font-medium">종합 위험도</p>
              <p className="text-xl font-bold">{riskStyle.label}</p>
            </div>
          </div>
        </div>

        {/* Category Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            부위별 상세 분석
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {result.categories.map((cat, i) => (
              <div key={i} className={`rounded-xl border p-4 ${getRiskColor(cat.riskScore)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                  <span className="text-sm font-bold">{cat.riskScore}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${getRiskBarColor(cat.riskScore)}`}
                    style={{ width: `${cat.riskScore * 10}%` }}
                  />
                </div>
                <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/70 mb-2">
                  {cat.status}
                </span>
                <ul className="text-sm space-y-1 mt-2">
                  {cat.findings.map((f, j) => (
                    <li key={j} className="text-gray-700">&bull; {f}</li>
                  ))}
                </ul>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{cat.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Risks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            주요 질병 위험 분석
          </h3>
          <div className="space-y-4">
            {result.topRisks.map((risk, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{risk.condition}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getProbabilityBadge(risk.probability)}`}>
                    발병 확률: {risk.probability}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{risk.explanation}</p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-800 mb-1">예방 수칙</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {risk.preventionTips.map((tip, j) => (
                      <li key={j}>&bull; {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-orange-500" />
            건강 관리 권고사항
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {result.recommendations.urgentActions.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-2">긴급 조치</h4>
                <ul className="text-sm text-red-700 space-y-2">
                  {result.recommendations.urgentActions.map((a, i) => (
                    <li key={i}>&bull; {a}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">추가 검사/진료</h4>
              <ul className="text-sm text-blue-700 space-y-2">
                {result.recommendations.followUp.map((f, i) => (
                  <li key={i}>&bull; {f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">생활습관 개선</h4>
              <ul className="text-sm text-green-700 space-y-2">
                {result.recommendations.lifestyle.map((l, i) => (
                  <li key={i}>&bull; {l}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Insurance Recommendations */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm border border-orange-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            맞춤 보험상품 추천
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            건강검진 분석 결과를 바탕으로 참고할 수 있는 보험상품 정보를 안내드립니다.
          </p>
          <p className="text-xs text-orange-600/70 mb-6">
            ※ 본 안내는 보험 모집 또는 계약 권유가 아닌 참고용 정보이며, 실제 가입 조건은 보험사에 문의하시기 바랍니다.
          </p>
          <div className="space-y-4">
            {result.insuranceRecommendations
              .sort((a, b) => a.priority - b.priority)
              .map((rec, i) => (
                <div key={i} className="bg-white rounded-xl border border-orange-100 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      {i === 0 ? (
                        <Star className="w-5 h-5 text-orange-600 fill-orange-600" />
                      ) : (
                        <span className="text-orange-600 font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      {rec.product && (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{rec.product.company}</span>
                            <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{rec.product.category}</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{rec.product.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{rec.product.description}</p>
                        </>
                      )}
                      <div className="bg-orange-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-orange-800">추천 사유</p>
                        <p className="text-sm text-orange-700 mt-1">{rec.reason}</p>
                      </div>
                      {rec.product && (
                        <div className="flex flex-wrap gap-2">
                          {rec.product.coverageHighlights.map((h, j) => (
                            <span key={j} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-200">{h}</span>
                          ))}
                        </div>
                      )}
                      {rec.product && (
                        <p className="text-sm text-gray-500 mt-3">
                          예상 월 보험료: <span className="font-semibold text-gray-700">{rec.product.monthlyPremiumRange}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* CTA: 상담 + 나도 분석 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={KAKAO_CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#FEE500] hover:bg-[#F5DD00] rounded-2xl p-5 shadow-sm border border-yellow-300 transition-all group"
          >
            <div className="w-12 h-12 bg-[#3C1E1E] rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-[#FEE500]" />
            </div>
            <div>
              <p className="font-bold text-[#3C1E1E] text-sm">보험설계사 상담</p>
              <p className="text-xs text-[#3C1E1E]/70 mt-0.5">카카오톡으로 전문 상담사와 1:1 상담</p>
            </div>
            <ExternalLink className="w-4 h-4 text-[#3C1E1E]/50 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </a>

          <Link
            href="/"
            className="flex items-center gap-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-2xl p-5 shadow-sm shadow-orange-200 transition-all group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">나도 무료 분석 받기</p>
              <p className="text-xs text-white/80 mt-0.5">건강검진 결과지로 AI 분석 시작하기</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500 leading-relaxed space-y-2">
          <p className="font-medium text-gray-600">면책 안내</p>
          <p>
            본 분석 결과는 인공지능(AI)이 생성한 참고용 건강 정보이며, 「의료법」상 의료행위에 해당하지 않습니다.
            보험상품 정보는 「보험업법」상 보험 모집 행위에 해당하지 않는 참고 정보입니다.
            정확한 건강 상태 확인 및 보험 가입은 반드시 전문 기관에 문의하시기 바랍니다.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400 space-y-1">
          <p className="text-sm text-gray-500">본 서비스는 AI 기반 건강검진 참고 분석 서비스입니다.</p>
          <p>본 서비스는 의료기관이 아니며, 제공되는 정보는 의학적 진단·치료를 대체하지 않습니다.</p>
          <p className="font-medium text-gray-500 pt-2">본 서비스는 특정 보험사의 공식 서비스가 아닙니다.</p>
        </div>
      </footer>
    </div>
  );
}
