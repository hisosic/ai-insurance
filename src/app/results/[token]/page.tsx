"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Activity,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Heart,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import {
  MedicalNoticeBanner,
  OverallSummary,
  CategoryAnalysis,
  TopRisks,
  Recommendations,
  InsuranceRecommendations,
  KakaoConsultButton,
  LegalDisclaimer,
  Footer,
} from "@/components/AnalysisResults";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
          <Heart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <span className="font-semibold">{record.name}</span>님({record.age}세, {record.gender})의 건강검진 AI 분석 결과입니다.
            <span className="text-blue-600 ml-1">({record.created_at} 분석)</span>
          </p>
        </div>

        <MedicalNoticeBanner />
        <OverallSummary result={result} />
        <CategoryAnalysis result={result} />
        <TopRisks result={result} />
        <Recommendations result={result} />
        <InsuranceRecommendations result={result} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <KakaoConsultButton />
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

        <LegalDisclaimer />
      </main>

      <Footer />
    </div>
  );
}
