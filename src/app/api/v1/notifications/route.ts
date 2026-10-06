import { NextRequest, NextResponse } from "next/server";
import { channelForFeature, insertRawMessage } from "@/lib/messages";
import { apiError, apiErrorFromException } from "@/lib/apiError";
import { VALID_KINDS } from "@/lib/apiHelpers";
import type { MessageKind } from "@/lib/types";

interface NotificationBody {
  feature?: string;
  kind?: string;
  title?: string;
  body?: string;
}

export async function POST(request: NextRequest) {
  let body: NotificationBody;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_REQUEST", "잘못된 요청 본문입니다.");
  }

  if (!body.feature || !body.kind || !body.title) {
    return apiError("INVALID_REQUEST", "feature, kind, title이 필요합니다.");
  }
  if (!VALID_KINDS.includes(body.kind as MessageKind)) {
    return apiError("INVALID_REQUEST", "kind는 info|success|error|warning 중 하나여야 합니다.");
  }

  const channel = channelForFeature(body.feature);
  if (!channel) {
    return apiError(
      "INVALID_REQUEST",
      "feature는 git_status|commits|pull_requests|issues|actions|general 중 하나여야 합니다."
    );
  }

  try {
    const row = await insertRawMessage(channel, {
      kind: body.kind as MessageKind,
      title: body.title,
      body: body.body,
    });
    return NextResponse.json(
      { notificationId: row.id, delivered: true, channel: "web" },
      { status: 201 }
    );
  } catch (err) {
    return apiErrorFromException(err);
  }
}
