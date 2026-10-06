"use client";

import { useState } from "react";
import { Play, AlertTriangle } from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import type { GitAction, GitCommandRequest, GitCommandResult } from "@/lib/types";

const ACTIONS: { value: GitAction; label: string; destructive?: boolean }[] = [
  { value: "add", label: "add (스테이징)" },
  { value: "commit", label: "commit (커밋)" },
  { value: "push", label: "push (원격 반영)" },
  { value: "pull", label: "pull (원격 가져오기)" },
  { value: "merge", label: "merge (병합)", destructive: true },
  { value: "branch-create", label: "branch (새 브랜치 생성)" },
  { value: "branch-delete", label: "branch (브랜치 삭제)", destructive: true },
  { value: "checkout", label: "checkout (브랜치 전환)" },
];

export function GitCommandPanel() {
  const { addMessage } = useMessenger();
  const [action, setAction] = useState<GitAction>("add");
  const [files, setFiles] = useState("");
  const [message, setMessage] = useState("");
  const [branch, setBranch] = useState("");
  const [remote, setRemote] = useState("origin");
  const [force, setForce] = useState(false);
  const [createBranch, setCreateBranch] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<GitCommandResult | null>(null);

  const meta = ACTIONS.find((a) => a.value === action)!;
  const isDestructive = Boolean(meta.destructive || (action === "push" && force));

  async function run() {
    setRunning(true);
    setResult(null);

    const req: GitCommandRequest = {
      action,
      files: files.trim() ? files.split(",").map((f) => f.trim()) : undefined,
      message: message.trim() || undefined,
      branch: branch.trim() || undefined,
      remote: remote.trim() || undefined,
      force,
      createBranch,
      confirmed,
    };

    try {
      const res = await fetch("/api/git/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      const data: GitCommandResult = await res.json();

      if (res.status === 409) {
        setNeedsConfirm(true);
        setRunning(false);
        return;
      }

      setResult(data);
      setNeedsConfirm(false);
      addMessage({
        channel: "commits",
        kind: data.success ? "success" : "error",
        title: `${meta.label} 실행 ${data.success ? "성공" : "실패"}`,
        body: data.output,
      });
    } catch (err) {
      const output = err instanceof Error ? err.message : String(err);
      setResult({ success: false, action, output });
      addMessage({ channel: "commits", kind: "error", title: `${meta.label} 실행 실패`, body: output });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 text-sm">
      <p className="text-zinc-500 dark:text-zinc-400">
        실행할 Git 명령을 선택하고 필요한 값을 입력한 뒤 실행하세요.
      </p>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">명령</span>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value as GitAction);
            setConfirmed(false);
            setNeedsConfirm(false);
            setResult(null);
          }}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      {(action === "add" || action === "commit") && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">대상 파일 (쉼표로 구분, 비우면 전체)</span>
          <input
            value={files}
            onChange={(e) => setFiles(e.target.value)}
            placeholder="src/app/page.tsx, README.md"
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      )}

      {action === "commit" && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">커밋 메시지</span>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="feat: 메신저 UI 추가"
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      )}

      {(action === "push" || action === "pull") && (
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">remote</span>
            <input
              value={remote}
              onChange={(e) => setRemote(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500">branch (비우면 현재 브랜치)</span>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>
      )}

      {(action === "merge" ||
        action === "branch-create" ||
        action === "branch-delete" ||
        action === "checkout") && (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">브랜치명</span>
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="feature/messenger-ui"
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      )}

      {action === "checkout" && (
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <input type="checkbox" checked={createBranch} onChange={(e) => setCreateBranch(e.target.checked)} />
          존재하지 않으면 새로 생성
        </label>
      )}

      {action === "push" && (
        <label className="flex items-center gap-2 text-xs text-amber-600">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => {
              setForce(e.target.checked);
              setConfirmed(false);
              setNeedsConfirm(false);
            }}
          />
          force push 사용 (위험)
        </label>
      )}

      {(isDestructive || needsConfirm) && (
        <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-700 dark:border-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <label className="flex flex-1 items-start gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              이 작업은 되돌리기 어려운 파괴적 명령입니다({meta.label}). 실행 전 반드시 확인이 필요합니다.
            </span>
          </label>
        </div>
      )}

      <button
        onClick={run}
        disabled={running || (isDestructive && !confirmed)}
        className="flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Play size={15} /> {running ? "실행 중..." : "실행"}
      </button>

      {result && (
        <div
          className={`rounded-md border p-2 text-xs ${
            result.success
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          <pre className="whitespace-pre-wrap break-words">{result.output}</pre>
        </div>
      )}
    </div>
  );
}
