"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  User,
  Phone,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  Loader2,
  ChevronRight,
  Star,
  X,
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

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedSensitive, setAgreedSensitive] = useState(false);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);
  const [showPrivacyDetail, setShowPrivacyDetail] = useState(false);
  const [showSensitiveDetail, setShowSensitiveDetail] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const handleSubmit = async () => {
    if (!agreedPrivacy || !agreedSensitive || !agreedDisclaimer) {
      setError("모든 동의 항목에 체크해주세요.");
      return;
    }
    if (!name || !age || !gender) {
      setError("이름, 나이, 성별은 필수 항목입니다.");
      return;
    }
    if (inputMode === "file" && !file) {
      setError("건강검진 결과지 파일을 업로드해주세요.");
      return;
    }
    if (inputMode === "text" && !textInput.trim()) {
      setError("건강검진 결과를 텍스트로 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (inputMode === "file" && file) {
      formData.append("file", file);
    } else {
      formData.append("textInput", textInput);
    }
    formData.append("name", name);
    formData.append("age", age);
    formData.append("gender", gender);
    formData.append("phone", phone);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">건강검진 AI 분석</h1>
              <p className="text-xs text-gray-500">한화 보험 맞춤 추천 서비스</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>Powered by AI</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!result ? (
          /* Input Form */
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                AI가 분석하는 나의 건강 리포트
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                건강검진 결과지를 업로드하면 AI 전문가가 정밀 분석하여
                <br />
                취약 부위와 맞춤 보험상품을 추천해드립니다.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* File Upload / Text Input */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  건강검진 결과 입력
                </h3>
                {/* Input Mode Tabs */}
                <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setInputMode("file")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      inputMode === "file"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    파일 업로드
                  </button>
                  <button
                    onClick={() => setInputMode("text")}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                      inputMode === "text"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    텍스트 입력
                  </button>
                </div>

                {inputMode === "file" ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-orange-400 bg-orange-50"
                        : file
                        ? "border-green-400 bg-green-50"
                        : "border-gray-300 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="font-medium text-green-700">{file.name}</p>
                        <p className="text-sm text-green-600">
                          {(file.size / 1024 / 1024).toFixed(1)}MB
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="mt-2 text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" /> 파일 변경
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-12 h-12 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-700">
                            {isDragActive ? "여기에 놓아주세요!" : "클릭하거나 파일을 드래그하세요"}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            PDF, JPG, PNG (최대 20MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={`건강검진 결과를 붙여넣기 해주세요.\n\n예시:\n혈압: 130/85 mmHg\n공복혈당: 110 mg/dL\n총콜레스테롤: 220 mg/dL\nHDL: 45 mg/dL\nLDL: 150 mg/dL\n중성지방: 180 mg/dL\nAST(GOT): 35 U/L\nALT(GPT): 42 U/L\nGGT: 60 U/L\n크레아티닌: 1.1 mg/dL\nHbA1c: 6.2%\nBMI: 26.5\n...`}
                      className="w-full h-52 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none text-sm leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      검진 결과 수치, 소견 등을 자유롭게 입력하거나 복사/붙여넣기 하세요.
                    </p>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-500" />
                  기본 정보 입력
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="홍길동"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        나이 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="35"
                          min="1"
                          max="120"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        성별 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none bg-white"
                      >
                        <option value="">선택</option>
                        <option value="남성">남성</option>
                        <option value="여성">여성</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      연락처
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010-1234-5678"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consent Section */}
            <div className="max-w-4xl mx-auto mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                약관 동의
              </h3>

              <div className="space-y-3">
                {/* 개인정보 수집·이용 동의 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacy"
                      checked={agreedPrivacy}
                      onChange={(e) => setAgreedPrivacy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="privacy" className="text-sm font-medium text-gray-900 cursor-pointer">
                        [필수] 개인정보 수집·이용 동의
                      </label>
                      <button
                        onClick={() => setShowPrivacyDetail(!showPrivacyDetail)}
                        className="ml-2 text-xs text-orange-500 hover:text-orange-700 underline"
                      >
                        {showPrivacyDetail ? "접기" : "상세보기"}
                      </button>
                      {showPrivacyDetail && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed space-y-2">
                          <p className="font-semibold text-gray-700">개인정보 수집·이용 동의서</p>
                          <p>「개인정보 보호법」 제15조 및 제17조에 따라 아래와 같이 개인정보를 수집·이용하고자 합니다.</p>
                          <table className="w-full border-collapse text-xs">
                            <tbody>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium w-28">수집 항목</td>
                                <td className="p-2">이름, 나이, 성별, 연락처</td>
                              </tr>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium">수집 목적</td>
                                <td className="p-2">건강검진 결과 AI 분석 및 맞춤 보험상품 정보 제공</td>
                              </tr>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium">보유 기간</td>
                                <td className="p-2">수집일로부터 1년 (보유 기간 경과 후 지체 없이 파기)</td>
                              </tr>
                            </tbody>
                          </table>
                          <p>귀하는 위 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 동의를 거부할 경우 건강검진 AI 분석 서비스 이용이 제한됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 민감정보 수집·이용 동의 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="sensitive"
                      checked={agreedSensitive}
                      onChange={(e) => setAgreedSensitive(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="sensitive" className="text-sm font-medium text-gray-900 cursor-pointer">
                        [필수] 민감정보(건강정보) 수집·이용 동의
                      </label>
                      <button
                        onClick={() => setShowSensitiveDetail(!showSensitiveDetail)}
                        className="ml-2 text-xs text-orange-500 hover:text-orange-700 underline"
                      >
                        {showSensitiveDetail ? "접기" : "상세보기"}
                      </button>
                      {showSensitiveDetail && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed space-y-2">
                          <p className="font-semibold text-gray-700">민감정보(건강정보) 수집·이용 동의서</p>
                          <p>「개인정보 보호법」 제23조에 따라 건강에 관한 정보(민감정보)를 처리하기 위해 별도의 동의를 받고자 합니다.</p>
                          <table className="w-full border-collapse text-xs">
                            <tbody>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium w-28">수집 항목</td>
                                <td className="p-2">건강검진 결과지(혈액검사, 신체계측, 영상검사 결과 등 건강정보 일체)</td>
                              </tr>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium">수집 목적</td>
                                <td className="p-2">AI 기반 건강 위험도 분석 및 맞춤 건강관리·보험상품 정보 제공</td>
                              </tr>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium">보유 기간</td>
                                <td className="p-2">수집일로부터 1년 (보유 기간 경과 후 지체 없이 파기)</td>
                              </tr>
                              <tr className="border border-gray-300">
                                <td className="bg-gray-100 p-2 font-medium">제3자 제공</td>
                                <td className="p-2">AI 분석을 위해 Google Gemini API로 데이터가 전송됩니다. 전송된 데이터는 분석 목적으로만 사용되며 별도 저장되지 않습니다.</td>
                              </tr>
                            </tbody>
                          </table>
                          <p>귀하는 위 민감정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 동의를 거부할 경우 건강검진 AI 분석 서비스 이용이 제한됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 서비스 면책 동의 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="disclaimer"
                      checked={agreedDisclaimer}
                      onChange={(e) => setAgreedDisclaimer(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <label htmlFor="disclaimer" className="text-sm font-medium text-gray-900 cursor-pointer">
                        [필수] 서비스 이용 안내 확인
                      </label>
                      <div className="mt-1.5 text-xs text-gray-500 leading-relaxed space-y-1">
                        <p>1. 본 서비스의 분석 결과는 AI가 생성한 <span className="font-medium text-gray-700">참고용 정보</span>이며, 「의료법」상 의료행위(진단·치료)에 해당하지 않습니다.</p>
                        <p>2. 건강 상태에 대한 정확한 판단은 반드시 의료기관의 전문의 상담을 통해 확인하시기 바랍니다.</p>
                        <p>3. 보험상품 추천은 AI가 검진 결과를 바탕으로 생성한 <span className="font-medium text-gray-700">참고 정보</span>이며, 「보험업법」상 보험 모집 또는 보험 계약 체결의 권유에 해당하지 않습니다.</p>
                        <p>4. 실제 보험 가입 시 보장 내용, 보험료, 가입 조건 등은 해당 보험사와의 상담을 통해 반드시 확인하시기 바랍니다.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 전체 동의 */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedPrivacy && agreedSensitive && agreedDisclaimer}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAgreedPrivacy(checked);
                        setAgreedSensitive(checked);
                        setAgreedDisclaimer(checked);
                      }}
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900">전체 동의</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="max-w-4xl mx-auto mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    AI 건강 분석 시작
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
              {loading && (
                <p className="mt-4 text-sm text-gray-500 animate-pulse-slow">
                  전문가 수준의 정밀 분석을 진행하고 있습니다. 잠시만 기다려주세요...
                </p>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="max-w-4xl mx-auto mt-12 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: Shield, title: "개인정보 보호", desc: "동의 기반 수집, 1년 후 파기" },
                { icon: Activity, title: "AI 참고용 분석", desc: "의료 진단을 대체하지 않음" },
                { icon: Heart, title: "보험 정보 제공", desc: "참고용 상품 안내 (모집행위 아님)" },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/60 border border-gray-100">
                  <item.icon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Results */
          <div className="animate-fade-in space-y-8">
            {/* Back button */}
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              새로운 분석하기
            </button>

            {/* Medical Notice Banner */}
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
                <div
                  className={`ml-4 px-4 py-2 rounded-xl border ${
                    getOverallRiskStyle(result.overallRiskLevel).bg
                  } ${getOverallRiskStyle(result.overallRiskLevel).text} ${
                    getOverallRiskStyle(result.overallRiskLevel).border
                  }`}
                >
                  <p className="text-xs font-medium">종합 위험도</p>
                  <p className="text-xl font-bold">
                    {getOverallRiskStyle(result.overallRiskLevel).label}
                  </p>
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
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${getRiskColor(cat.riskScore)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{cat.name}</h4>
                        <span className="text-sm font-bold">{cat.riskScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all ${getRiskBarColor(
                            cat.riskScore
                          )}`}
                          style={{ width: `${cat.riskScore * 10}%` }}
                        />
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-white/70 mb-2">
                        {cat.status}
                      </span>
                      <ul className="text-sm space-y-1 mt-2">
                        {cat.findings.map((f, j) => (
                          <li key={j} className="text-gray-700">
                            &bull; {f}
                          </li>
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
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getProbabilityBadge(
                          risk.probability
                        )}`}
                      >
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
                건강검진 분석 결과를 바탕으로 참고할 수 있는 한화 보험상품 정보를 안내드립니다.
              </p>
              <p className="text-xs text-orange-600/70 mb-6">
                ※ 본 안내는 보험 모집 또는 계약 권유가 아닌 참고용 정보이며, 실제 가입 조건은 보험사에 문의하시기 바랍니다.
              </p>
              <div className="space-y-4">
                {result.insuranceRecommendations
                  .sort((a, b) => a.priority - b.priority)
                  .map((rec, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-orange-100 p-5 shadow-sm"
                    >
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
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  {rec.product.company}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                                  {rec.product.category}
                                </span>
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                {rec.product.name}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{rec.product.description}</p>
                            </>
                          )}
                          <div className="bg-orange-50 rounded-lg p-3 mb-3">
                            <p className="text-sm font-medium text-orange-800">
                              추천 사유
                            </p>
                            <p className="text-sm text-orange-700 mt-1">{rec.reason}</p>
                          </div>
                          {rec.product && (
                            <div className="flex flex-wrap gap-2">
                              {rec.product.coverageHighlights.map((h, j) => (
                                <span
                                  key={j}
                                  className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-lg border border-gray-200"
                                >
                                  {h}
                                </span>
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

            {/* Disclaimer */}
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
                  반드시 해당 보험사(한화생명, 한화손해보험)에 직접 문의하여 확인하시기 바랍니다.
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400 space-y-1">
          <p className="text-sm text-gray-500">본 서비스는 AI 기반 건강검진 참고 분석 서비스입니다.</p>
          <p>본 서비스는 의료기관이 아니며, 제공되는 정보는 의학적 진단·치료를 대체하지 않습니다.</p>
          <p>보험상품 안내는 참고 정보이며, 「보험업법」상 보험 모집 행위에 해당하지 않습니다.</p>
          <p className="pt-2 text-gray-500">한화생명 | 한화손해보험</p>
        </div>
      </footer>
    </div>
  );
}
