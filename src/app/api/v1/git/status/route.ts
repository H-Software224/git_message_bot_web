import { NextRequest, NextResponse } from "next/server";
import { getStatus } from "@/lib/git";
import { apiError, apiErrorFromException } from "@/lib/apiError";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return apiError("INVALID_REQUEST", "repo 쿼리 파라미터가 필요합니다.");
  }

  try {
    const status = await getStatus();
    return NextResponse.json({
      branch: status.branch,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged.map((f) => f.path),
      unstaged: status.unstaged.map((f) => f.path),
      untracked: status.untracked,
    });
  } catch (err) {
    return apiErrorFromException(err);
  }
}
