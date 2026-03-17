const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegramNotification(data: {
  name: string;
  age: string;
  gender: string;
  phone: string;
  overallRiskLevel: string;
  summary: string;
  recordId: number;
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
    `${emoji} <b>종합 위험도:</b> ${label}`,
    `📝 ${data.summary}`,
    ``,
    `🔗 관리자 페이지에서 상세 확인 (ID: ${data.recordId})`,
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
