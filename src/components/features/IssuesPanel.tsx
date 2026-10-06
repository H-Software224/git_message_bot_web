"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import type { GitHubConfigStatus, GitHubIssue } from "@/lib/types";
import { GitHubSetupHint } from "./GitHubSetupHint";

export function IssuesPanel() {
  const { addMessage } = useMessenger();
  const [status, setStatus] = useState<GitHubConfigStatus | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/github/issues")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setIssues(data.issues ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function announce(issue: GitHubIssue) {
    addMessage({
      channel: "issues",
      kind: "info",
      title: `공지: #${issue.number} ${issue.title}`,
      body: `${issue.url}\n작성자: ${issue.author ?? "알 수 없음"}${
        issue.labels.length ? `\n라벨: ${issue.labels.join(", ")}` : ""
      }`,
    });
  }

  if (loading) return <p className="text-sm text-zinc-400">불러오는 중...</p>;
  if (error) return <p className="text-sm text-red-500">{error}</p>;
  if (!status?.configured) return <GitHubSetupHint status={status} />;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-zinc-500 dark:text-zinc-400">
        {status.owner}/{status.repo}의 열려 있는 Issue입니다.
      </p>
      {issues.length === 0 && <p className="text-xs text-zinc-400">열려 있는 Issue가 없습니다.</p>}
      <ul className="flex flex-col gap-2">
        {issues.map((issue) => (
          <li key={issue.number} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 truncate font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                >
                  #{issue.number} {issue.title} <ExternalLink size={12} className="shrink-0 opacity-50" />
                </a>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {issue.author ?? "알 수 없음"} · {new Date(issue.createdAt).toLocaleDateString("ko-KR")}
                  {issue.labels.length > 0 && ` · ${issue.labels.join(", ")}`}
                </p>
              </div>
              <button
                onClick={() => announce(issue)}
                className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700"
              >
                <Megaphone size={12} /> 공지
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
