"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Share2 } from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import type { GitStatusResult } from "@/lib/types";

export function GitStatusPanel() {
  const { addMessage } = useMessenger();
  const [status, setStatus] = useState<GitStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/git/status");
      if (!res.ok) throw new Error("상태 조회에 실패했습니다.");
      const data: GitStatusResult = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load]);

  function refresh() {
    setLoading(true);
    load();
  }

  function share() {
    if (!status) return;
    addMessage({
      channel: "git-status",
      kind: status.isClean ? "success" : "info",
      title: `브랜치 ${status.branch ?? "(unknown)"} 상태 요약`,
      body: [
        `추적 브랜치: ${status.tracking ?? "없음"} (ahead ${status.ahead} / behind ${status.behind})`,
        `staged: ${status.staged.length}개, unstaged: ${status.unstaged.length}개, untracked: ${status.untracked.length}개`,
        status.isClean ? "작업 트리가 깨끗합니다." : "커밋되지 않은 변경사항이 있습니다.",
      ].join("\n"),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          대상 저장소의 `git status`를 조회합니다.
        </p>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> 새로고침
          </button>
          <button
            onClick={share}
            disabled={!status}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            <Share2 size={13} /> 채널에 공유
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {status && (
        <div className="flex flex-col gap-3 text-sm">
          <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <p className="font-semibold text-zinc-900 dark:text-zinc-50">
              브랜치: {status.branch ?? "(감지 불가)"}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              추적: {status.tracking ?? "없음"} · ahead {status.ahead} · behind {status.behind}
            </p>
          </div>

          <FileList title="Staged" items={status.staged.map((f) => f.path)} color="text-emerald-600" />
          <FileList title="Unstaged" items={status.unstaged.map((f) => f.path)} color="text-amber-600" />
          <FileList title="Untracked" items={status.untracked} color="text-zinc-500" />
          {status.conflicted.length > 0 && (
            <FileList title="충돌" items={status.conflicted} color="text-red-600" />
          )}
        </div>
      )}
    </div>
  );
}

function FileList({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className={`mb-1 text-xs font-semibold ${color}`}>
        {title} ({items.length})
      </p>
      <ul className="space-y-0.5 rounded-md bg-zinc-50 p-2 font-mono text-xs dark:bg-zinc-900">
        {items.map((f) => (
          <li key={f} className="truncate text-zinc-700 dark:text-zinc-300">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
