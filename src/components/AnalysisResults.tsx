"use client";

import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Star,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import {
  getRiskColor,
  getRiskBarColor,
  getOverallRiskStyle,
  getHealthScoreStyle,
  getProbabilityBadge,
  KAKAO_CONSULT_URL,
} from "@/lib/risk-utils";

export function MedicalNoticeBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-amber-800 leading-relaxed">
        아래 분석 결과는 AI가 생성한 <span className="font-semibold">참고용 정보</span>입니다.
        의학적 진단이나 치료를 대체하지 않으며, 정확한 건강 상태 확인은 반드시 의료기관 전문의와 상담하시기 바랍니다.
      </p>
    </div>
  );
}

export function HealthScoreGauge({ result }: { result: AnalysisResult }) {
  const score = result.healthScore ?? 0;
  const isUnavailable = score < 0;
  const scoreStyle = getHealthScoreStyle(score);
  const riskStyle = getOverallRiskStyle(result.overallRiskLevel);

  const bgColor = isUnavailable ? "bg-gray-400" : score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  const ringColor = isUnavailable ? "ring-gray-200" : score >= 80 ? "ring-green-200" : score >= 60 ? "ring-yellow-200" : score >= 40 ? "ring-orange-200" : "ring-red-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center">
      <div className={`w-28 h-28 ${bgColor} rounded-full ring-4 ${ringColor} flex items-center justify-center shadow-lg`}>
        {isUnavailable ? (
          <span className="text-lg font-bold text-white text-center leading-tight">판정<br/>불가</span>
        ) : (
          <span className="text-4xl font-black text-white">{score}</span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${scoreStyle.color}`}
          style={{ backgroundColor: isUnavailable ? "#f3f4f6" : score >= 80 ? "#f0fdf4" : score >= 60 ? "#fefce8" : score >= 40 ? "#fff7ed" : "#fef2f2" }}>
          {scoreStyle.label}
        </span>
        <span className={`px-3 py-1 rounded-full border text-xs font-medium ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
          위험도: {riskStyle.label}
        </span>
      </div>
      {isUnavailable && (
        <p className="text-xs text-gray-500 mt-2 text-center">추출된 수치가 부족하여 점수를 산정할 수 없습니다</p>
      )}
    </div>
  );
}

export function OverallSummary({ result }: { result: AnalysisResult }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">종합 건강 분석 결과</h2>
      <p className="text-gray-600 leading-relaxed">{result.summary}</p>
    </div>
  );
}

export function CategoryAnalysis({ result }: { result: AnalysisResult }) {
  return (
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
              <span className="text-sm font-bold">{cat.riskScore < 0 ? "수치없음" : `${cat.riskScore}/10`}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all ${getRiskBarColor(cat.riskScore)}`}
                style={{ width: `${cat.riskScore < 0 ? 0 : cat.riskScore * 10}%` }}
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
  );
}

export function TopRisks({ result }: { result: AnalysisResult }) {
  return (
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
  );
}

export function Recommendations({ result }: { result: AnalysisResult }) {
  return (
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
  );
}

export function InsuranceRecommendations({ result }: { result: AnalysisResult }) {
  return (
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
  );
}

export function KakaoConsultButton() {
  return (
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
  );
}

export function LegalDisclaimer() {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-xs text-gray-500 leading-relaxed space-y-3">
      <p className="font-semibold text-gray-700 text-sm">면책 및 법적 고지</p>
      <div>
        <p className="font-medium text-gray-600 mb-0.5">[의료 관련 면책]</p>
        <p>
          본 분석 결과는 인공지능(AI)이 생성한 <span className="font-medium text-gray-700">참고용 건강 정보</span>이며,
          「의료법」 제2조에 따른 의료행위(진단, 검안, 처방, 투약, 치료 등)에 해당하지 않습니다.
          AI 분석 결과만으로 건강 상태를 판단하거나 치료 방침을 결정하지 마시고,
          반드시 의료기관의 전문의 상담을 통해 정확한 진단 및 치료를 받으시기 바랍니다.
          본 서비스 제공자는 AI 분석 결과에 의존하여 발생한 건강상의 문제에 대해 법적 책임을 부담하지 않습니다.
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-600 mb-0.5">[보험 관련 면책]</p>
        <p>
          본 서비스에서 제공하는 보험상품 정보는 AI가 건강검진 결과를 바탕으로 생성한 <span className="font-medium text-gray-700">참고용 정보</span>이며,
          「보험업법」 제83조에 따른 보험 모집, 보험계약 체결의 권유 또는 중개 행위에 해당하지 않습니다.
          표시된 보험료 및 보장 내용은 실제와 다를 수 있으며, 정확한 보험료, 보장 범위, 가입 조건, 보험금 지급 사유 등은
          반드시 해당 보험사에 직접 문의하여 확인하시기 바랍니다.
          본 서비스 제공자는 보험상품 추천 정보에 의존하여 발생한 재산상의 손해에 대해 법적 책임을 부담하지 않습니다.
        </p>
      </div>
      <div>
        <p className="font-medium text-gray-600 mb-0.5">[AI 및 데이터 관련 안내]</p>
        <p>
          본 서비스는 Google Gemini AI를 활용하여 분석을 수행하며, AI의 특성상 분석 결과의 정확성, 완전성, 적시성을 보장하지 않습니다.
          입력하신 개인정보 및 건강정보는 「개인정보 보호법」에 따라 동의하신 범위 내에서 수집·이용되며,
          수집일로부터 1년간 보관 후 지체 없이 파기됩니다.
          개인정보에 관한 열람, 정정·삭제, 처리정지 요구 등의 권리는 관련 법령에 따라 행사하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white/60">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400 space-y-1">
        <p className="text-sm text-gray-500">본 서비스는 AI 기반 건강검진 참고 분석 서비스입니다.</p>
        <p>본 서비스는 의료기관이 아니며, 제공되는 정보는 의학적 진단·치료를 대체하지 않습니다.</p>
        <p>보험상품 안내는 참고 정보이며, 「보험업법」상 보험 모집 행위에 해당하지 않습니다.</p>
        <p className="font-medium text-gray-500 pt-2">본 서비스는 특정 보험사의 공식 서비스가 아니며, 어떠한 보험사와도 제휴·협약 관계에 있지 않습니다.</p>
        <p>언급된 보험상품 정보는 공개된 자료를 바탕으로 한 참고용이며, 실제 상품과 다를 수 있습니다.</p>
      </div>
    </footer>
  );
}
