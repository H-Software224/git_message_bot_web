import { NextRequest, NextResponse } from "next/server";
import { channelForFeature, selectRawMessages } from "@/lib/messages";
import { apiError, apiErrorFromException } from "@/lib/apiError";
import { VALID_KINDS } from "@/lib/apiHelpers";
import type { MessageKind } from "@/lib/types";

export async function GET(request: NextRequest) {
  const feature = request.nextUrl.searchParams.get("feature");
  if (!feature) {
    return apiError("INVALID_REQUEST", "feature 쿼리 파라미터가 필요합니다.");
  }

  const channel = channelForFeature(feature);
  if (!channel) {
    return apiError(
      "INVALID_REQUEST",
      "feature는 git_status|commits|pull_requests|issues|actions|general 중 하나여야 합니다."
    );
  }

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
    const items = await selectRawMessages(channel, {
      limit,
      kind: (kindParam as MessageKind) || undefined,
    });
    return NextResponse.json({ feature, items });
  } catch (err) {
    return apiErrorFromException(err);
  }
}
