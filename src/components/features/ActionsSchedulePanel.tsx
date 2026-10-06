"use client";

import { useEffect, useState } from "react";
import { Clock, Share2 } from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import type { GitHubConfigStatus, WorkflowScheduleInfo } from "@/lib/types";

export function ActionsSchedulePanel() {
  const { addMessage } = useMessenger();
  const [status, setStatus] = useState<GitHubConfigStatus | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowScheduleInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github/actions")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setWorkflows(data.workflows ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function share(wf: WorkflowScheduleInfo) {
    addMessage({
      channel: "actions",
      kind: wf.lastRun?.conclusion === "failure" ? "error" : "info",
      title: `${wf.name} 워크플로우`,
      body: [
        `파일: .github/workflows/${wf.file}`,
        wf.crons.length ? `스케줄(cron, UTC): ${wf.crons.join(", ")}` : "스케줄 트리거 없음",
        wf.lastRun
          ? `최근 실행: ${wf.lastRun.status} / ${wf.lastRun.conclusion ?? "-"} (${new Date(
              wf.lastRun.createdAt
            ).toLocaleString("ko-KR")})`
          : "최근 실행 정보 없음",
      ].join("\n"),
    });
  }

  if (loading) return <p className="text-sm text-zinc-400">불러오는 중...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-zinc-500 dark:text-zinc-400">
        .github/workflows의 스케줄(cron) 트리거와 최근 실행 상태입니다.
        {!status?.configured && " (GITHUB_TOKEN 미설정 시 최근 실행 상태는 표시되지 않습니다.)"}
      </p>
      {workflows.length === 0 && (
        <p className="text-xs text-zinc-400">
          `.github/workflows` 디렉터리에 워크플로우 파일이 없습니다.
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {workflows.map((wf) => (
          <li key={wf.file} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">{wf.name}</p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{wf.file}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300">
                  <Clock size={12} />
                  {wf.crons.length ? wf.crons.join(", ") : "schedule 트리거 없음"}
                </p>
                {wf.lastRun && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    최근 실행: {wf.lastRun.status} / {wf.lastRun.conclusion ?? "-"}
                  </p>
                )}
              </div>
              <button
                onClick={() => share(wf)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
              >
                <Share2 size={12} /> 공유
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
