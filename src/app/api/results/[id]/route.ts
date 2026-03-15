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

  // 공개 공유용: 연락처 등 민감 정보 제외
  return NextResponse.json({
    id: record.id,
    name: record.name,
    age: record.age,
    gender: record.gender,
    overall_risk_level: record.overall_risk_level,
    summary: record.summary,
    analysis_json: record.analysis_json,
    created_at: record.created_at,
  });
}
