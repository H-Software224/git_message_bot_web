"use client";

import { Menu, Hash, X } from "lucide-react";
import { useMessenger, useChannelInfo } from "@/context/MessengerContext";

export function TopBar() {
  const { activeChannel, isDrawerOpen, setDrawerOpen } = useMessenger();
  const channel = useChannelInfo(activeChannel);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex min-w-0 items-center gap-2">
        <Hash size={18} className="text-zinc-400" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {channel.label}
          </p>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {channel.description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setDrawerOpen(!isDrawerOpen)}
        aria-label="핵심 기능 메뉴 열기"
        aria-expanded={isDrawerOpen}
        className={`flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
          isDrawerOpen
            ? "border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
            : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        }`}
      >
        {isDrawerOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
    </header>
  );
}
