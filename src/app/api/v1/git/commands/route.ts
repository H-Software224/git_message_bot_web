import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { runGitCommand } from "@/lib/git";
import { insertRawMessage } from "@/lib/messages";
import { apiError, apiErrorFromException } from "@/lib/apiError";
import type { GitAction } from "@/lib/types";

const SUPPORTED_COMMANDS: GitAction[] = ["add", "commit", "push", "merge", "pull", "checkout"];

interface CommandArgs {
  message?: string;
  files?: string[];
  branch?: string;
  // 명세에는 없지만, PRD 9장의 "파괴적 명령은 실행 전 확인 필수" 정책을 지키기 위한 선택적 확장 필드.
  confirmed?: boolean;
}

interface CommandRequestBody {
  repo?: string;
  command?: string;
  args?: CommandArgs;
}

export async function POST(request: NextRequest) {
  let body: CommandRequestBody;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_REQUEST", "잘못된 요청 본문입니다.");
  }

  if (!body.repo || !body.command || !SUPPORTED_COMMANDS.includes(body.command as GitAction)) {
    return apiError(
      "INVALID_REQUEST",
      `repo와 command(${SUPPORTED_COMMANDS.join("|")})가 필요합니다.`
    );
  }

  const command = body.command as GitAction;
  const args = body.args ?? {};

  const result = await runGitCommand({
    action: command,
    message: args.message,
    files: args.files,
    branch: args.branch,
    confirmed: args.confirmed,
  });

  const status: "success" | "error" = result.success ? "success" : "error";
  const commandId = randomUUID();
  const log = result.requiresConfirmation
    ? "confirmed=true 없이는 실행할 수 없는 파괴적 명령입니다."
    : result.output;

  try {
    const historyRow =
      command === "commit"
        ? await insertRawMessage("commits", {
            kind: status,
            title: args.message?.trim() || "commit 실행",
            body: log,
          })
        : await insertRawMessage("general", {
            kind: status,
            title: `[COMMAND:${command}] 실행 ${result.success ? "성공" : "실패"}`,
            body: log,
          });

    return NextResponse.json(
      { commandId, status, log, historyRecordId: historyRow.id },
      { status: 201 }
    );
  } catch (err) {
    return apiErrorFromException(err);
  }
}
