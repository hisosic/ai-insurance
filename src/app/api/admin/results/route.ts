import { NextRequest, NextResponse } from "next/server";
import { getAnalysisList, deleteAnalysis, updateMemo } from "@/lib/db";

const UNAUTHORIZED = NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

export async function GET(request: NextRequest) {
  if (request.cookies.get("admin_auth")?.value !== "true") return UNAUTHORIZED;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || undefined;

  const data = getAnalysisList(page, limit, search);
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  if (request.cookies.get("admin_auth")?.value !== "true") return UNAUTHORIZED;
  const { searchParams } = new URL(request.url);
  const id = parseInt(searchParams.get("id") || "0");

  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
  }

  const success = deleteAnalysis(id);
  if (!success) {
    return NextResponse.json({ error: "결과를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// 메모 저장
export async function PATCH(request: NextRequest) {
  if (request.cookies.get("admin_auth")?.value !== "true") return UNAUTHORIZED;

  const { id, memo } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
  }

  const success = updateMemo(id, memo || "");
  if (!success) {
    return NextResponse.json({ error: "결과를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
