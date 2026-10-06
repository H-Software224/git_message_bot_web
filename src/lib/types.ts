export type ChannelId =
  | "general"
  | "git-status"
  | "commits"
  | "pull-requests"
  | "issues"
  | "actions";

export interface Channel {
  id: ChannelId;
  label: string;
  description: string;
}

export const CHANNELS: Channel[] = [
  { id: "general", label: "general", description: "전체 공지 및 요약" },
  { id: "git-status", label: "git-status", description: "Git 상태 체크 결과" },
  { id: "commits", label: "commits", description: "add / commit / push 실행 로그" },
  { id: "pull-requests", label: "pull-requests", description: "PR 생성 및 Merge 요청" },
  { id: "issues", label: "issues", description: "Issue 공지" },
  { id: "actions", label: "actions", description: "GitHub Actions 스케줄/실행 결과" },
];

export type MessageKind = "info" | "success" | "error" | "warning";

export interface BotMessage {
  id: string;
  channel: ChannelId;
  kind: MessageKind;
  title: string;
  body?: string;
  timestamp: number;
}

export interface GitFileStatus {
  path: string;
  index: string;
  workingDir: string;
}

export interface GitStatusResult {
  branch: string | null;
  tracking: string | null;
  ahead: number;
  behind: number;
  staged: GitFileStatus[];
  unstaged: GitFileStatus[];
  untracked: string[];
  conflicted: string[];
  isClean: boolean;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileTreeNode[];
}

export type GitAction =
  | "add"
  | "commit"
  | "push"
  | "pull"
  | "merge"
  | "branch-create"
  | "branch-delete"
  | "checkout";

export interface GitCommandRequest {
  action: GitAction;
  files?: string[];
  message?: string;
  remote?: string;
  branch?: string;
  createBranch?: boolean;
  force?: boolean;
  confirmed?: boolean;
}

export interface GitCommandResult {
  success: boolean;
  action: GitAction;
  output: string;
  requiresConfirmation?: boolean;
}

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  state: string;
  labels: string[];
  author: string | null;
  createdAt: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  url: string;
  state: string;
  draft: boolean;
  mergeable: boolean | null;
  reviewDecision: string | null;
  author: string | null;
  headBranch: string;
  baseBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
}

export interface WorkflowScheduleInfo {
  name: string;
  file: string;
  crons: string[];
  lastRun: {
    status: string;
    conclusion: string | null;
    url: string;
    createdAt: string;
  } | null;
}

export interface GitHubConfigStatus {
  configured: boolean;
  owner: string | null;
  repo: string | null;
}
