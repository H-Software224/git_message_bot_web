import { NextResponse } from "next/server";
import { listPullRequests } from "@/lib/github";

export async function GET() {
  try {
    const result = await listPullRequests();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
