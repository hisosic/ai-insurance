"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  X,
  Activity,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  Lock,
  LogOut,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface AnalysisRecord {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  overall_risk_level: string;
  summary: string;
  analysis_json: string;
  created_at: string;
}

interface AnalysisDetail {
  summary: string;
  overallRiskLevel: string;
  categories: {
    name: string;
    riskScore: number;
    status: string;
    findings: string[];
    details: string;
  }[];
  topRisks: {
    condition: string;
    probability: string;
    explanation: string;
    preventionTips: string[];
  }[];
  recommendations: {
    lifestyle: string[];
    followUp: string[];
    urgentActions: string[];
  };
  insuranceRecommendations: {
    productId: string;
    priority: number;
    reason: string;
    product?: {
      name: string;
      company: string;
      category: string;
    };
  }[];
}

const riskLevelMap: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "양호", color: "text-green-700", bg: "bg-green-100" },
  moderate: { label: "주의", color: "text-yellow-700", bg: "bg-yellow-100" },
  high: { label: "경고", color: "text-orange-700", bg: "bg-orange-100" },
  critical: { label: "위험", color: "text-red-700", bg: "bg-red-100" },
  unknown: { label: "미정", color: "text-gray-700", bg: "bg-gray-100" },
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const [parsedDetail, setParsedDetail] = useState<AnalysisDetail | null>(null);
  const limit = 15;

  // 기존 세션 확인
  useEffect(() => {
    fetch("/api/admin/results?page=1&limit=1")
      .then((res) => {
        if (res.ok) setAuthenticated(true);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthenticated(true);
      setPassword("");
    } else {
      setAuthError("비밀번호가 올바르지 않습니다.");
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthenticated(false);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.set("search", search);

    const res = await fetch(`/api/admin/results?${params}`);
    if (res.status === 401) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setRecords(data.results);
    setTotal(data.total);
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    if (authenticated) fetchRecords();
  }, [authenticated, fetchRecords]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/results?id=${id}`, { method: "DELETE" });
    fetchRecords();
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
      setParsedDetail(null);
    }
  };

  const handleView = (record: AnalysisRecord) => {
    setSelectedRecord(record);
    try {
      setParsedDetail(JSON.parse(record.analysis_json));
    } catch {
      setParsedDetail(null);
    }
  };

  const getRisk = (level: string) => riskLevelMap[level] || riskLevelMap.unknown;

  // Stats
  const stats = {
    total,
    critical: records.filter((r) => r.overall_risk_level === "critical").length,
    high: records.filter((r) => r.overall_risk_level === "high").length,
  };

  // 인증 확인 중
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // 로그인 화면
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">관리자 로그인</h1>
              <p className="text-sm text-gray-500 mt-1">비밀번호를 입력해주세요</p>
            </div>
            <div className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="관리자 비밀번호"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {authError}
                </p>
              )}
              <button
                onClick={handleLogin}
                disabled={authLoading || !password}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
                로그인
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-orange-500">
              메인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">관리자 대시보드</h1>
                <p className="text-xs text-gray-500">건강검진 분석 결과 관리</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1 transition"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              메인으로
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">총 분석 건수</p>
              <p className="text-xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">위험 판정</p>
              <p className="text-xl font-bold text-red-600">{stats.critical}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">경고 판정</p>
              <p className="text-xl font-bold text-orange-600">{stats.high}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">현재 페이지</p>
              <p className="text-xl font-bold text-gray-900">
                {page}/{totalPages || 1}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="이름 또는 요약 내용으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
            >
              검색
            </button>
            {search && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                }}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg text-sm"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">불러오는 중...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {search ? "검색 결과가 없습니다." : "아직 분석 결과가 없습니다."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">이름</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">나이</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">성별</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">연락처</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">위험도</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">요약</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">분석일시</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const risk = getRisk(record.overall_risk_level);
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-gray-500">{record.id}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{record.name}</td>
                        <td className="px-4 py-3 text-gray-600">{record.age}세</td>
                        <td className="px-4 py-3 text-gray-600">{record.gender}</td>
                        <td className="px-4 py-3 text-gray-600">{record.phone || "-"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${risk.bg} ${risk.color}`}
                          >
                            {risk.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                          {record.summary}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {record.created_at}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleView(record)}
                              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                              title="상세 보기"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(record.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                총 {total}건 중 {(page - 1) * limit + 1}-{Math.min(page * limit, total)}건
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        page === pageNum
                          ? "bg-orange-500 text-white"
                          : "border border-gray-300 hover:bg-white text-gray-700"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedRecord && parsedDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedRecord.name}님 분석 결과
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedRecord.created_at} | {selectedRecord.age}세 {selectedRecord.gender}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  setParsedDetail(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Summary */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getRisk(parsedDetail.overallRiskLevel).bg
                    } ${getRisk(parsedDetail.overallRiskLevel).color}`}
                  >
                    종합: {getRisk(parsedDetail.overallRiskLevel).label}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{parsedDetail.summary}</p>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">부위별 분석</h3>
                <div className="grid grid-cols-2 gap-3">
                  {parsedDetail.categories
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((cat, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 text-sm">{cat.name}</span>
                          <span className="text-xs font-bold text-gray-500">
                            {cat.riskScore}/10
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                          <div
                            className={`h-1.5 rounded-full ${
                              cat.riskScore <= 3
                                ? "bg-green-500"
                                : cat.riskScore <= 5
                                ? "bg-yellow-500"
                                : cat.riskScore <= 7
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${cat.riskScore * 10}%` }}
                          />
                        </div>
                        <ul className="text-xs text-gray-600 space-y-0.5">
                          {cat.findings.map((f, j) => (
                            <li key={j}>&bull; {f}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Risks */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">주요 질병 위험</h3>
                <div className="space-y-2">
                  {parsedDetail.topRisks.map((risk, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {risk.condition}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            risk.probability === "높음"
                              ? "bg-red-100 text-red-700"
                              : risk.probability === "중간"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {risk.probability}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{risk.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance Recommendations */}
              {parsedDetail.insuranceRecommendations?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">추천 보험상품</h3>
                  <div className="space-y-2">
                    {parsedDetail.insuranceRecommendations
                      .sort((a, b) => a.priority - b.priority)
                      .map((rec, i) => (
                        <div key={i} className="border border-orange-200 rounded-lg p-3 bg-orange-50/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-orange-600">#{i + 1}</span>
                            {rec.product && (
                              <>
                                <span className="font-medium text-sm text-gray-900">
                                  {rec.product.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({rec.product.company})
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{rec.reason}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">권고사항</h3>
                <div className="grid grid-cols-1 gap-3">
                  {parsedDetail.recommendations.urgentActions?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-800 mb-1">긴급 조치</p>
                      <ul className="text-xs text-red-700 space-y-0.5">
                        {parsedDetail.recommendations.urgentActions.map((a, i) => (
                          <li key={i}>&bull; {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-blue-800 mb-1">추가 검사/진료</p>
                    <ul className="text-xs text-blue-700 space-y-0.5">
                      {parsedDetail.recommendations.followUp.map((f, i) => (
                        <li key={i}>&bull; {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-800 mb-1">생활습관 개선</p>
                    <ul className="text-xs text-green-700 space-y-0.5">
                      {parsedDetail.recommendations.lifestyle.map((l, i) => (
                        <li key={i}>&bull; {l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
