import { NextRequest, NextResponse } from "next/server";
import { runGitCommand } from "@/lib/git";
import type { GitCommandRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  let body: GitCommandRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!body.action) {
    return NextResponse.json({ error: "action이 필요합니다." }, { status: 400 });
  }

  const result = await runGitCommand(body);

  if (result.requiresConfirmation) {
    return NextResponse.json(result, { status: 409 });
  }

  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
