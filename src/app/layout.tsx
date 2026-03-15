import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건강검진 AI 분석 | 한화 보험 추천",
  description: "AI가 건강검진 결과를 분석하여 맞춤 한화 보험상품을 추천해드립니다",
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
