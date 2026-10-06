import type { NextRequest } from "next/server";
import type { MessageKind } from "./types";
import { apiError } from "./apiError";

export const VALID_KINDS: MessageKind[] = ["info", "success", "error", "warning"];

export interface HistoryBody {
  kind: MessageKind;
  title: string;
  body?: string;
}

type ParseResult<T> = { ok: true; value: T } | { ok: false; response: ReturnType<typeof apiError> };

export async function parseHistoryBody(request: NextRequest): Promise<ParseResult<HistoryBody>> {
  let raw: { kind?: string; title?: string; body?: string };
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: apiError("INVALID_REQUEST", "잘못된 요청 본문입니다.") };
  }

  if (!raw.title || !raw.kind || !VALID_KINDS.includes(raw.kind as MessageKind)) {
    return { ok: false, response: apiError("INVALID_REQUEST", "kind, title이 필요합니다.") };
  }

  return { ok: true, value: { kind: raw.kind as MessageKind, title: raw.title, body: raw.body } };
}
