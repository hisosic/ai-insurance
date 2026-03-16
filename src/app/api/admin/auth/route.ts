import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, changeAdminPassword } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (verifyAdminPassword(password)) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_auth", "true", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8시간
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "비밀번호가 올바르지 않습니다" }, { status: 401 });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_auth");
  return response;
}

// 비밀번호 변경
export async function PATCH(request: NextRequest) {
  if (request.cookies.get("admin_auth")?.value !== "true") {
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
