import { NextRequest, NextResponse } from "next/server";
import { getAnalysisById, verifySession } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다" }, { status: 400 });
  }

  const record = getAnalysisById(numId);

  if (!record) {
    return NextResponse.json({ error: "결과를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(record);
}
