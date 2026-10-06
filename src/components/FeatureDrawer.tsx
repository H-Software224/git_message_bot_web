"use client";

import { useState, type ComponentType } from "react";
import {
  ArrowLeft,
  X,
  GitBranch,
  FolderTree,
  Terminal,
  CircleDot,
  GitPullRequest,
  CalendarClock,
  Bell,
} from "lucide-react";
import { useMessenger } from "@/context/MessengerContext";
import { GitStatusPanel } from "./features/GitStatusPanel";
import { FileExplorerPanel } from "./features/FileExplorerPanel";
import { GitCommandPanel } from "./features/GitCommandPanel";
import { IssuesPanel } from "./features/IssuesPanel";
import { PullRequestsPanel } from "./features/PullRequestsPanel";
import { ActionsSchedulePanel } from "./features/ActionsSchedulePanel";
import { NotificationsPanel } from "./features/NotificationsPanel";

interface FeatureDef {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  component: ComponentType;
}

const FEATURES: FeatureDef[] = [
  {
    id: "status",
    code: "5.1",
    title: "Git Status 현황 조회",
    description: "변경 파일, 스테이징 여부, 브랜치 ahead/behind 확인",
    icon: GitBranch,
    component: GitStatusPanel,
  },
  {
    id: "files",
    code: "5.2",
    title: "파일/폴더 구조 탐색",
    description: "Repository 트리 구조 및 파일 내용 조회",
    icon: FolderTree,
    component: FileExplorerPanel,
  },
  {
    id: "commands",
    code: "5.3 · 5.4",
    title: "Git 명령 실행",
    description: "add / commit / push / merge 등 선택 실행 및 결과 반영",
    icon: Terminal,
    component: GitCommandPanel,
  },
  {
    id: "issues",
    code: "5.5",
    title: "Issues 조회 및 알림",
    description: "열려 있는 Issue 확인 후 팀에 공지",
    icon: CircleDot,
    component: IssuesPanel,
  },
  {
    id: "prs",
    code: "5.6",
    title: "Pull Request / Merge 요청",
    description: "PR 상태 확인 및 Collaborator에게 Merge 요청",
    icon: GitPullRequest,
    component: PullRequestsPanel,
  },
  {
    id: "actions",
    code: "5.7",
    title: "Actions 스케줄 연동",
    description: "워크플로우 cron 스케줄 및 실행 결과 확인",
    icon: CalendarClock,
    component: ActionsSchedulePanel,
  },
  {
    id: "notifications",
    code: "5.8",
    title: "실시간 완료 알림",
    description: "모든 채널의 실행 결과 알림 모아보기",
    icon: Bell,
    component: NotificationsPanel,
  },
];

export function FeatureDrawer() {
  const { isDrawerOpen, setDrawerOpen } = useMessenger();
  const [selected, setSelected] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const active = FEATURES.find((f) => f.id === selected);

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/30 sm:hidden"
        onClick={() => setDrawerOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 px-3 dark:border-zinc-800">
          {active ? (
            <button
              onClick={() => setSelected(null)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="목록으로"
            >
              <ArrowLeft size={16} />
            </button>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white">
              <Terminal size={16} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {active ? active.title : "핵심 기능"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {active ? active.description : "PRD 5장 핵심 기능 바로가기"}
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="닫기"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {active ? (
            <active.component />
          ) : (
            <ul className="flex flex-col gap-2">
              {FEATURES.map((feature) => (
                <li key={feature.id}>
                  <button
                    onClick={() => setSelected(feature.id)}
                    className="flex w-full items-start gap-3 rounded-lg border border-zinc-200 p-3 text-left transition-colors hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-800 dark:hover:bg-emerald-500/10"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                      <feature.icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {feature.title}
                        <span className="rounded bg-zinc-100 px-1 text-[10px] font-normal text-zinc-400 dark:bg-zinc-900">
                          {feature.code}
                        </span>
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{feature.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
