import { NextRequest, NextResponse } from "next/server";
import { insertMessage, isSupabaseConfigured, listAllMessages } from "@/lib/messages";
import { CHANNELS, type BotMessage, type ChannelId } from "@/lib/types";

const CHANNEL_IDS = new Set<ChannelId>(CHANNELS.map((c) => c.id));

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, messages: [] as BotMessage[] });
  }

  try {
    const messages = await listAllMessages();
    return NextResponse.json({ configured: true, messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase가 설정되지 않았습니다." }, { status: 503 });
  }

  let body: { channel?: ChannelId; kind?: BotMessage["kind"]; title?: string; body?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!body.channel || !CHANNEL_IDS.has(body.channel) || !body.kind || !body.title) {
    return NextResponse.json({ error: "channel, kind, title이 필요합니다." }, { status: 400 });
  }

  try {
    const message = await insertMessage(body.channel, body.kind, body.title, body.body);
    return NextResponse.json({ message });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
