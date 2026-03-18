import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  changeAdminPassword,
  createSession,
  verifySession,
  deleteSession,
  checkLoginRateLimit,
  resetLoginAttempts,
} from "@/lib/db";

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // HTTP 환경 호환 (HTTPS 도입 시 true로 변경)
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 8, // 8시간
  path: "/",
};

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // Rate limiting
  const rateCheck = checkLoginRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `로그인 시도가 너무 많습니다. ${rateCheck.retryAfterSec}초 후 다시 시도해주세요.` },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "비밀번호를 입력해주세요" }, { status: 400 });
  }

  if (verifyAdminPassword(password)) {
    resetLoginAttempts(ip);
    const sessionToken = createSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", sessionToken, COOKIE_OPTIONS);
    return response;
  }

  return NextResponse.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
}

export async function DELETE(request: NextRequest) {
  const sessionToken = request.cookies.get("admin_session")?.value;
  if (sessionToken) {
    deleteSession(sessionToken);
  }
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}

// 비밀번호 변경
export async function PATCH(request: NextRequest) {
  const sessionToken = request.cookies.get("admin_session")?.value;
  if (!sessionToken || !verifySession(sessionToken)) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "현재 비밀번호와 새 비밀번호를 입력해주세요" }, { status: 400 });
  }

  const result = changeAdminPassword(currentPassword, newPassword);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
