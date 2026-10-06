import { KeyRound } from "lucide-react";
import type { GitHubConfigStatus } from "@/lib/types";

export function GitHubSetupHint({ status }: { status: GitHubConfigStatus | null }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-zinc-300 p-3 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
      <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-200">
        <KeyRound size={15} /> GitHub 연동이 필요합니다
      </div>
      <p className="text-xs leading-relaxed">
        프로젝트 루트의 <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code> 파일에
        Personal Access Token을 설정하면 Issue / PR / Actions 실행 결과를 조회할 수 있습니다.
      </p>
      <pre className="whitespace-pre-wrap break-words rounded bg-zinc-100 p-2 text-[11px] dark:bg-zinc-900">
{`GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=${status?.owner ?? "H-Software224"}
GITHUB_REPO=${status?.repo ?? "git_message_bot_web"}`}
      </pre>
      <p className="text-[11px] text-zinc-400">
        설정 후 개발 서버를 재시작하면 반영됩니다. (repo · issues 권한 필요)
      </p>
    </div>
  );
}
