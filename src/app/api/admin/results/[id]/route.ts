import { NextRequest, NextResponse } from "next/server";
import { getAnalysisById } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = getAnalysisById(parseInt(id));

  if (!record) {
    return NextResponse.json({ error: "결과를 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json(record);
}
