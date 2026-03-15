import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건강검진 AI 분석 | 맞춤 보험 정보",
  description: "AI가 건강검진 결과를 분석하여 건강 위험도를 평가하고 맞춤 보험상품 정보를 제공합니다. 특정 보험사의 공식 서비스가 아닙니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
