import { NextRequest, NextResponse } from "next/server";
import { insertRawMessage, selectRawMessages } from "@/lib/messages";
import { apiError, apiErrorFromException } from "@/lib/apiError";
import { parseHistoryBody, VALID_KINDS } from "@/lib/apiHelpers";
import type { MessageKind } from "@/lib/types";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 20;
  if (!Number.isInteger(limit) || limit <= 0) {
    return apiError("INVALID_REQUEST", "limit은 양의 정수여야 합니다.");
  }

  const kindParam = request.nextUrl.searchParams.get("kind");
  if (kindParam && !VALID_KINDS.includes(kindParam as MessageKind)) {
    return apiError("INVALID_REQUEST", "kind는 info|success|error|warning 중 하나여야 합니다.");
  }

  try {
    const items = await selectRawMessages("pull-requests", {
      limit,
      kind: (kindParam as MessageKind) || undefined,
      titleLike: "[MERGE]%",
    });
    return NextResponse.json(items);
  } catch (err) {
    return apiErrorFromException(err);
  }
}

export async function POST(request: NextRequest) {
  const parsed = await parseHistoryBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const row = await insertRawMessage("pull-requests", parsed.value);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    return apiErrorFromException(err);
  }
}
