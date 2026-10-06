"use client";

import { useMemo } from "react";
import { Bell } from "lucide-react";
import { kindColor, useMessenger } from "@/context/MessengerContext";
import { CHANNELS } from "@/lib/types";

export function NotificationsPanel() {
  const { messages, setActiveChannel, setDrawerOpen } = useMessenger();

  const sorted = useMemo(() => [...messages].sort((a, b) => b.timestamp - a.timestamp), [messages]);

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
        <Bell size={14} /> 모든 채널의 실행 결과 알림을 한눈에 확인합니다.
      </p>
      {sorted.length === 0 && <p className="text-xs text-zinc-400">아직 알림이 없습니다.</p>}
      <ul className="flex flex-col gap-2">
        {sorted.map((msg) => {
          const channel = CHANNELS.find((c) => c.id === msg.channel);
          return (
            <li key={msg.id} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <button
                onClick={() => {
                  setActiveChannel(msg.channel);
                  setDrawerOpen(false);
                }}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    #{channel?.label ?? msg.channel}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {new Date(msg.timestamp).toLocaleString("ko-KR")}
                  </span>
                </div>
                <p className={`mt-1 font-medium ${kindColor(msg.kind)}`}>{msg.title}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
