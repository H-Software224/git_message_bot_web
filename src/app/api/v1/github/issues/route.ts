import { NextRequest, NextResponse } from "next/server";
import { listIssues } from "@/lib/github";
import { apiErrorFromException } from "@/lib/apiError";

export async function GET(request: NextRequest) {
  const state = (request.nextUrl.searchParams.get("state") ?? "open") as
    | "open"
    | "closed"
    | "all";

  try {
    const { issues } = await listIssues(state);
    return NextResponse.json(issues);
  } catch (err) {
    return apiErrorFromException(err);
  }
}
