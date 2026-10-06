import { NextRequest, NextResponse } from "next/server";
import { getFileTree } from "@/lib/git";
import { apiError, apiErrorFromException } from "@/lib/apiError";

export async function GET(request: NextRequest) {
  const repo = request.nextUrl.searchParams.get("repo");
  if (!repo) {
    return apiError("INVALID_REQUEST", "repo 쿼리 파라미터가 필요합니다.");
  }

  const subPath = request.nextUrl.searchParams.get("path") ?? ".";

  try {
    const tree = await getFileTree(subPath);
    return NextResponse.json(tree);
  } catch (err) {
    return apiErrorFromException(err);
  }
}
