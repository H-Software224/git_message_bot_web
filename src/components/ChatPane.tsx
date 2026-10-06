"use client";

import { Bot } from "lucide-react";
import { useMemo } from "react";
import { kindColor, useMessenger } from "@/context/MessengerContext";

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatPane() {
  const { messages, activeChannel, loading, storageConfigured, storageError } = useMessenger();

  const filtered = useMemo(
    () => messages.filter((m) => m.channel === activeChannel),
    [messages, activeChannel]
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
      {!storageConfigured && (
        <div className="mx-auto mb-4 max-w-3xl rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          Supabase가 설정되지 않아 메시지가 저장되지 않습니다. .env.local의 SUPABASE_URL / SUPABASE_ANON_KEY를 확인해주세요.
        </div>
      )}
      {storageError && (
        <div className="mx-auto mb-4 max-w-3xl rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-700 dark:bg-red-500/10 dark:text-red-400">
          저장소 오류: {storageError}
        </div>
      )}
      {loading ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
          <Bot size={32} className="mb-2 animate-pulse opacity-50" />
          <p className="text-sm">메시지를 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
          <Bot size={32} className="mb-2 opacity-50" />
          <p className="text-sm">아직 이 채널에는 메시지가 없습니다.</p>
          <p className="text-xs">☰ 메뉴에서 기능을 실행하면 결과가 여기에 표시됩니다.</p>
        </div>
      ) : (
        <ul className="mx-auto flex max-w-3xl flex-col gap-4">
          {filtered.map((msg) => (
            <li key={msg.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Bot size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    Git Messenger Bot
                  </span>
                  <span className="text-xs text-zinc-400">{formatTime(msg.timestamp)}</span>
                </div>
                <p className={`text-sm font-medium ${kindColor(msg.kind)}`}>{msg.title}</p>
                {msg.body && (
                  <pre className="mt-1 whitespace-pre-wrap break-words rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    {msg.body}
                  </pre>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
