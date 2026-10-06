import { NextRequest, NextResponse } from "next/server";
import { deleteRepoFile, writeRepoFile } from "@/lib/git";
import { apiError, apiErrorFromException } from "@/lib/apiError";

interface FilesRequestBody {
  repo?: string;
  path?: string;
  action?: string;
  content?: string;
}

export async function PATCH(request: NextRequest) {
  let body: FilesRequestBody;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_REQUEST", "잘못된 요청 본문입니다.");
  }

  if (!body.repo || !body.path || !body.action) {
    return apiError("INVALID_REQUEST", "repo, path, action이 필요합니다.");
  }
  if (!["create", "update", "delete"].includes(body.action)) {
    return apiError("INVALID_REQUEST", "action은 create|update|delete 중 하나여야 합니다.");
  }
  if ((body.action === "create" || body.action === "update") && body.content === undefined) {
    return apiError("INVALID_REQUEST", "create/update 작업에는 content가 필요합니다.");
  }

  try {
    if (body.action === "delete") {
      await deleteRepoFile(body.path);
      return NextResponse.json({
        path: body.path,
        action: body.action,
        success: true,
        summary: "파일이 삭제되었습니다.",
      });
    }

    await writeRepoFile(body.path, body.content!);
    const lineCount = body.content!.length === 0 ? 0 : body.content!.split("\n").length;
    return NextResponse.json({
      path: body.path,
      action: body.action,
      success: true,
      summary: `${lineCount}줄이 기록되었습니다.`,
    });
  } catch (err) {
    return apiErrorFromException(err);
  }
}
