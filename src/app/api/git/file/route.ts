import { NextRequest, NextResponse } from "next/server";
import { readRepoFile } from "@/lib/git";

export async function GET(request: NextRequest) {
  const relPath = request.nextUrl.searchParams.get("path");
  if (!relPath) {
    return NextResponse.json({ error: "path 쿼리 파라미터가 필요합니다." }, { status: 400 });
  }

  try {
    const content = await readRepoFile(relPath);
    return NextResponse.json({ path: relPath, content });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
