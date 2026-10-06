import { NextRequest, NextResponse } from "next/server";
import { insertRawMessage } from "@/lib/messages";
import { apiErrorFromException } from "@/lib/apiError";
import { parseHistoryBody } from "@/lib/apiHelpers";

export async function POST(request: NextRequest) {
  const parsed = await parseHistoryBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const row = await insertRawMessage("git-status", parsed.value);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return apiErrorFromException(err);
  }
}
