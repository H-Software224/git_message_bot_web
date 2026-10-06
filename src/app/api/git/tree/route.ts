import { NextResponse } from "next/server";
import { getFileTree } from "@/lib/git";

export async function GET() {
  try {
    const tree = await getFileTree();
    return NextResponse.json(tree);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
