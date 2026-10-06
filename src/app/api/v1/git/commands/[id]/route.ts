import { NextRequest, NextResponse } from "next/server";
import { updateRawMessage } from "@/lib/messages";
import { apiError, apiErrorFromException } from "@/lib/apiError";
import { VALID_KINDS } from "@/lib/apiHelpers";
import type { MessageKind } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return apiError("INVALID_REQUEST", "id는 정수여야 합니다.");
  }

  let body: { kind?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_REQUEST", "잘못된 요청 본문입니다.");
  }

  if (!body.kind || !VALID_KINDS.includes(body.kind as MessageKind)) {
    return apiError("INVALID_REQUEST", "kind(success|error 등)가 필요합니다.");
  }

  const patch = {
    kind: body.kind as MessageKind,
    ...(body.body !== undefined ? { body: body.body } : {}),
  };

  try {
    const updated =
      (await updateRawMessage("commits", id, patch)) ??
      (await updateRawMessage("general", id, patch));

    if (!updated) {
      return apiError("NOT_FOUND", "해당 이력 레코드를 찾을 수 없습니다.");
    }
    return NextResponse.json(updated);
  } catch (err) {
    return apiErrorFromException(err);
  }
}
