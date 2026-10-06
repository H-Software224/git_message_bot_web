"use client";

import { Hash, Bot } from "lucide-react";
import { CHANNELS } from "@/lib/types";
import { useMessenger } from "@/context/MessengerContext";

export function Sidebar() {
  const { activeChannel, setActiveChannel, setDrawerOpen } = useMessenger();

  return (
    <aside className="hidden sm:flex w-64 shrink-0 flex-col bg-[#3f0e40] text-zinc-100">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
          <Bot size={18} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Git Messenger Bot</p>
          <p className="truncate text-xs text-white/50">git_message_bot_web</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-wide text-white/40">
          채널
        </p>
        <ul className="space-y-0.5 px-2">
          {CHANNELS.map((channel) => {
            const active = channel.id === activeChannel;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveChannel(channel.id);
                    setDrawerOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Hash size={15} className="shrink-0 opacity-70" />
                  <span className="truncate">{channel.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
            나
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">로컬 저장소 연결됨</p>
            <p className="truncate text-[11px] text-white/40">v1 · Draft</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
