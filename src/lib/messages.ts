import { getSupabase } from "./supabase";
import { CHANNELS, type BotMessage, type ChannelId, type MessageKind } from "./types";

export const CHANNEL_TABLE: Record<ChannelId, string> = {
  general: "messages_general",
  "git-status": "messages_git_status",
  commits: "messages_commits",
  "pull-requests": "messages_pull_requests",
  issues: "messages_issues",
  actions: "messages_actions",
};

// API 명세의 `feature` 파라미터(snake_case) → 내부 ChannelId(kebab-case) 매핑
const FEATURE_TO_CHANNEL: Record<string, ChannelId> = {
  general: "general",
  git_status: "git-status",
  commits: "commits",
  pull_requests: "pull-requests",
  issues: "issues",
  actions: "actions",
};

export function channelForFeature(feature: string): ChannelId | null {
  return FEATURE_TO_CHANNEL[feature] ?? null;
}

interface MessageRow {
  id: number;
  kind: BotMessage["kind"];
  title: string;
  body: string | null;
  created_at: string;
}

export type RawMessageRow = MessageRow;

function toBotMessage(channel: ChannelId, row: MessageRow): BotMessage {
  return {
    id: `${channel}-${row.id}`,
    channel,
    kind: row.kind,
    title: row.title,
    body: row.body ?? undefined,
    timestamp: new Date(row.created_at).getTime(),
  };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

export async function listAllMessages(): Promise<BotMessage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const results = await Promise.all(
    CHANNELS.map(async (channel) => {
      const { data, error } = await supabase
        .from(CHANNEL_TABLE[channel.id])
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw new Error(`${channel.id}: ${error.message}`);
      return (data as MessageRow[]).map((row) => toBotMessage(channel.id, row));
    })
  );

  return results.flat().sort((a, b) => a.timestamp - b.timestamp);
}

export async function insertMessage(
  channel: ChannelId,
  kind: BotMessage["kind"],
  title: string,
  body?: string
): Promise<BotMessage> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");

  const { data, error } = await supabase
    .from(CHANNEL_TABLE[channel])
    .insert({ kind, title, body: body ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toBotMessage(channel, data as MessageRow);
}

export async function insertRawMessage(
  channel: ChannelId,
  fields: { kind: MessageKind; title: string; body?: string | null }
): Promise<RawMessageRow> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");

  const { data, error } = await supabase
    .from(CHANNEL_TABLE[channel])
    .insert({ kind: fields.kind, title: fields.title, body: fields.body ?? null })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as RawMessageRow;
}

export async function selectRawMessages(
  channel: ChannelId,
  opts: { limit?: number; kind?: MessageKind; titleLike?: string } = {}
): Promise<RawMessageRow[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");

  let query = supabase
    .from(CHANNEL_TABLE[channel])
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 20);

  if (opts.kind) query = query.eq("kind", opts.kind);
  if (opts.titleLike) query = query.ilike("title", opts.titleLike);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as RawMessageRow[];
}

export async function updateRawMessage(
  channel: ChannelId,
  id: number,
  patch: { kind?: MessageKind; body?: string }
): Promise<RawMessageRow | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase가 설정되지 않았습니다.");

  const { data, error } = await supabase
    .from(CHANNEL_TABLE[channel])
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as RawMessageRow | null) ?? null;
}
