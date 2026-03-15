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
  X,
  MessageCircle,
  Share2,
  Users,
  Copy,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { getOverallRiskStyle } from "@/lib/risk-utils";
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
  const [recordId, setRecordId] = useState<number | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);

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
      setRecordId(data.recordId || null);
      setShareToken(data.shareToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getShareUrl = () => {
    if (!shareToken || typeof window === "undefined") return window?.location?.origin || "";
    return `${window.location.origin}/results/${shareToken}`;
  };

  const buildShareText = () => {
    if (!result) return "";
    const riskLabel = getOverallRiskStyle(result.overallRiskLevel).label;
    const categories = result.categories
      .map((c) => `  - ${c.name}: ${c.riskScore}/10 (${c.status})`)
      .join("\n");
    const risks = result.topRisks
      .slice(0, 3)
      .map((r) => `  - ${r.condition} (${r.probability})`)
      .join("\n");
    const shareUrl = getShareUrl();
    return `[AI 건강검진 분석 결과]\n\n종합 위험도: ${riskLabel}\n${result.summary}\n\n[부위별 분석]\n${categories}\n\n[주요 위험]\n${risks}\n\n※ AI 참고용 분석이며, 정확한 진단은 의료기관 상담이 필요합니다.\n\n결과 보기: ${shareUrl}`;
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyResult = () => {
    copyToClipboard(buildShareText());
  };

  const handleShareKakao = () => {
    const shareUrl = getShareUrl();
    const riskLabel = result ? getOverallRiskStyle(result.overallRiskLevel).label : "";
    const text = `[AI 건강검진 분석 결과] 종합 위험도: ${riskLabel}\n${result?.summary || ""}\n\n결과 보기: ${shareUrl}`;

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isMobile) {
      // 모바일: intent로 카카오톡 공유 (대화상대 선택 화면 표시)
      const intentUrl =
        `intent://send?text=${encodeURIComponent(text)}#Intent;` +
        `scheme=kakaolink;` +
        `package=com.kakao.talk;` +
        `S.browser_fallback_url=${encodeURIComponent(shareUrl)};` +
        `end;`;

      // iOS는 intent 미지원 → 네이티브 share API 사용
      if (/iPhone|iPad/i.test(navigator.userAgent)) {
        if (navigator.share) {
          navigator.share({ title: "AI 건강검진 분석 결과", text, url: shareUrl });
        } else {
          copyToClipboard(text);
          alert("분석 결과가 복사되었습니다.\n카카오톡에서 붙여넣기 해주세요.");
        }
      } else {
        // Android
        window.location.href = intentUrl;
      }
    } else {
      // PC: 클립보드 복사 후 카카오톡 웹 안내
      copyToClipboard(text);
      alert("분석 결과가 클립보드에 복사되었습니다.\n카카오톡에서 붙여넣기(Ctrl+V) 해주세요.");
    }
  };

  const handleShareTwitter = () => {
    const shareUrl = getShareUrl();
    const riskLabel = result ? getOverallRiskStyle(result.overallRiskLevel).label : "";
    const text = `[AI 건강검진 분석] 종합 위험도: ${riskLabel} - ${result?.summary || ""}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareNative = () => {
    setShowShareMenu(true);
  };

  const handleReferFriend = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `AI가 무료로 건강검진 결과를 분석해주고, 맞춤 보험까지 추천해줍니다!\n지금 바로 분석받아보세요: ${origin}`;
    copyToClipboard(text);
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
              <p className="text-xs text-gray-500">AI 건강분석 및 보험 정보 서비스</p>
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
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                          if (v.length <= 3) setPhone(v);
                          else if (v.length <= 7) setPhone(`${v.slice(0, 3)}-${v.slice(3)}`);
                          else setPhone(`${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`);
                        }}
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

            <MedicalNoticeBanner />
            <OverallSummary result={result} />

            <CategoryAnalysis result={result} />
            <TopRisks result={result} />
            <Recommendations result={result} />
            <InsuranceRecommendations result={result} />

            {/* CTA: 상담 / 공유 / 추천 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KakaoConsultButton />

              {/* 결과 공유 */}
              <div className="relative">
                <button
                  onClick={handleShareNative}
                  className="w-full flex items-center gap-4 bg-white hover:bg-blue-50 rounded-2xl p-5 shadow-sm border border-gray-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">분석결과 공유</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      카카오톡, SNS로 결과 전달하기
                    </p>
                  </div>
                </button>

                {/* 공유 메뉴 드롭다운 */}
                {showShareMenu && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-20 p-2 space-y-1">
                    <button
                      onClick={() => { handleShareKakao(); setShowShareMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-yellow-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-[#FEE500] rounded-lg flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-[#3C1E1E]" />
                      </div>
                      <span className="text-sm text-gray-700">카카오톡 공유</span>
                    </button>
                    <button
                      onClick={() => { handleShareTwitter(); setShowShareMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">X</span>
                      </div>
                      <span className="text-sm text-gray-700">X (Twitter) 공유</span>
                    </button>
                    <button
                      onClick={() => { handleShareFacebook(); setShowShareMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-[#1877F2] rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <span className="text-sm text-gray-700">Facebook 공유</span>
                    </button>
                    <button
                      onClick={() => { handleCopyResult(); setShowShareMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Copy className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-700">텍스트 복사</span>
                    </button>
                    <button
                      onClick={() => setShowShareMenu(false)}
                      className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600"
                    >
                      닫기
                    </button>
                  </div>
                )}
              </div>

              {/* 친구 추천 */}
              <button
                onClick={handleReferFriend}
                className="flex items-center gap-4 bg-white hover:bg-green-50 rounded-2xl p-5 shadow-sm border border-gray-200 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-sm">친구에게 추천</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {copied ? "링크가 복사되었습니다!" : "무료 AI 분석 링크 공유하기"}
                  </p>
                </div>
              </button>
            </div>

            <LegalDisclaimer />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
