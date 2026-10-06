import { NextResponse } from "next/server";
import { getWorkflowSchedules } from "@/lib/workflows";
import { getRepoContext } from "@/lib/github";

export async function GET() {
  try {
    const [status, workflows] = await Promise.all([
      getRepoContext(),
      getWorkflowSchedules(),
    ]);
    return NextResponse.json({ status, workflows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
