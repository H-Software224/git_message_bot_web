"use client";

import { useEffect, useState } from "react";
import { ExternalLink, GitMerge, Send } from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import type { GitHubConfigStatus, GitHubPullRequest } from "@/lib/types";
import { GitHubSetupHint } from "./GitHubSetupHint";

export function PullRequestsPanel() {
  const { addMessage } = useMessenger();
  const [status, setStatus] = useState<GitHubConfigStatus | null>(null);
  const [pulls, setPulls] = useState<GitHubPullRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [collaborator, setCollaborator] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/github/prs")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setPulls(data.pulls ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function requestMerge(pr: GitHubPullRequest) {
    const target = collaborator[pr.number]?.trim() || "담당 Collaborator";
    addMessage({
      channel: "pull-requests",
      kind: "info",
      title: `Merge 요청 → ${target}`,
      body: [
        `PR: ${pr.url}`,
        `제목: #${pr.number} ${pr.title}`,
        `변경 요약: +${pr.additions} / -${pr.deletions} (${pr.changedFiles}개 파일), ${pr.headBranch} → ${pr.baseBranch}`,
        `요청자: Git Messenger Bot 사용자`,
      ].join("\n"),
    });
  }

  if (loading) return <p className="text-sm text-zinc-400">불러오는 중...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!status?.configured) return <GitHubSetupHint status={status} />;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-zinc-500 dark:text-zinc-400">
        {status.owner}/{status.repo}의 열려 있는 Pull Request입니다.
      </p>
      {pulls.length === 0 && <p className="text-xs text-zinc-400">열려 있는 PR이 없습니다.</p>}
      <ul className="flex flex-col gap-2">
        {pulls.map((pr) => (
          <li key={pr.number} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <a
              href={pr.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 truncate font-medium text-zinc-900 hover:underline dark:text-zinc-50"
            >
              #{pr.number} {pr.title} <ExternalLink size={12} className="shrink-0 opacity-50" />
            </a>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {pr.headBranch} → {pr.baseBranch} · +{pr.additions}/-{pr.deletions} ·{" "}
              {pr.draft ? "Draft" : pr.mergeable === false ? "충돌 있음" : "Merge 가능"}
            </p>
            <div className="mt-2 flex gap-2">
              <input
                value={collaborator[pr.number] ?? ""}
                onChange={(e) => setCollaborator((prev) => ({ ...prev, [pr.number]: e.target.value }))}
                placeholder="Collaborator 이름 (예: @teammate)"
                className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              />
              <button
                onClick={() => requestMerge(pr)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
              >
                <Send size={12} /> Merge 요청
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p className="flex items-center gap-1 text-[11px] text-zinc-400">
        <GitMerge size={12} /> Merge 실행 자체는 GitHub에서 진행하고, 여기서는 팀에 요청 메시지만 전송합니다.
      </p>
    </div>
  );
}
