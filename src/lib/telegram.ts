const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegramNotification(data: {
  name: string;
  age: string;
  gender: string;
  phone: string;
  overallRiskLevel: string;
  healthScore: number;
  summary: string;
  recordId: number;
  shareToken: string;
  baseUrl: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const riskLabel: Record<string, string> = {
    low: "낮음",
    moderate: "보통",
    high: "높음",
    critical: "매우 높음",
  };

  const riskEmoji: Record<string, string> = {
    low: "🟢",
    moderate: "🟡",
    high: "🟠",
    critical: "🔴",
  };

  const emoji = riskEmoji[data.overallRiskLevel] || "⚪";
  const label = riskLabel[data.overallRiskLevel] || data.overallRiskLevel;

  const message = [
    `📋 <b>새로운 분석 결과</b>`,
    ``,
    `👤 <b>이름:</b> ${data.name}`,
    `📅 <b>나이:</b> ${data.age}세 / ${data.gender}`,
    `📞 <b>연락처:</b> ${data.phone || "미입력"}`,
    ``,
    `💯 <b>건강 점수:</b> ${data.healthScore}점 / 100점`,
    `${emoji} <b>종합 위험도:</b> ${label}`,
    `📝 ${data.summary}`,
    ``,
    `🔗 <b>결과 페이지:</b> ${data.baseUrl}/results/${data.shareToken}`,
    `🛠 <b>관리자:</b> ${data.baseUrl}/admin`,
  ].join("\n");

  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}
