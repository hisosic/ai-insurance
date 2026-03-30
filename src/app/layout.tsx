import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "건강검진 AI 분석",
  description: "AI가 건강검진 결과를 분석하여 건강 위험도를 평가합니다.",
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
