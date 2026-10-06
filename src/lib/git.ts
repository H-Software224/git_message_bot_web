import { simpleGit, type SimpleGit, type StatusResult } from "simple-git";
import path from "node:path";
import { promises as fs } from "node:fs";
import type {
  FileTreeNode,
  GitAction,
  GitCommandRequest,
  GitCommandResult,
  GitStatusResult,
} from "./types";

export const REPO_ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "build",
  "coverage",
]);

const DESTRUCTIVE_ACTIONS = new Set<GitAction>([
  "merge",
  "branch-delete",
]);

function git(): SimpleGit {
  return simpleGit({ baseDir: REPO_ROOT });
}

export function isDestructive(req: GitCommandRequest): boolean {
  if (DESTRUCTIVE_ACTIONS.has(req.action)) return true;
  if (req.action === "push" && req.force) return true;
  if (req.action === "checkout" && req.force) return true;
  return false;
}

export async function getStatus(): Promise<GitStatusResult> {
  const g = git();
  const raw: StatusResult = await g.status();

  return {
    branch: raw.current,
    tracking: raw.tracking,
    ahead: raw.ahead,
    behind: raw.behind,
    staged: raw.staged.map((p) => ({
      path: p,
      index: statusCode(raw, p, "index"),
      workingDir: statusCode(raw, p, "working_dir"),
    })),
    unstaged: raw.modified
      .filter((p) => !raw.staged.includes(p))
      .map((p) => ({ path: p, index: " ", workingDir: "M" })),
    untracked: raw.not_added,
    conflicted: raw.conflicted,
    isClean: raw.isClean(),
  };
}

function statusCode(
  raw: StatusResult,
  file: string,
  kind: "index" | "working_dir"
): string {
  const entry = raw.files.find((f) => f.path === file);
  if (!entry) return " ";
  return kind === "index" ? entry.index : entry.working_dir;
}

function assertWithinRepo(resolved: string) {
  if (resolved !== REPO_ROOT && !resolved.startsWith(REPO_ROOT + path.sep)) {
    throw new Error("Invalid path");
  }
}

export async function getFileTree(startRelPath = ".", maxDepth = 6): Promise<FileTreeNode> {
  const startAbs = path.resolve(REPO_ROOT, startRelPath);
  assertWithinRepo(startAbs);

  async function walk(dir: string, depth: number): Promise<FileTreeNode[]> {
    if (depth > maxDepth) return [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nodes: FileTreeNode[] = [];

    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith(".") && entry.name !== ".github") continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(REPO_ROOT, fullPath);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: relPath,
          type: "dir",
          children: await walk(fullPath, depth + 1),
        });
      } else {
        nodes.push({ name: entry.name, path: relPath, type: "file" });
      }
    }
    return nodes;
  }

  const stat = await fs.stat(startAbs);
  const relPath = path.relative(REPO_ROOT, startAbs) || ".";
  const name = startAbs === REPO_ROOT ? path.basename(REPO_ROOT) : path.basename(startAbs);

  if (stat.isFile()) {
    return { name, path: relPath, type: "file" };
  }

  const children = await walk(startAbs, 0);
  return { name, path: relPath, type: "dir", children };
}

const MAX_FILE_BYTES = 200_000;

export async function readRepoFile(relPath: string): Promise<string> {
  const resolved = path.resolve(REPO_ROOT, relPath);
  assertWithinRepo(resolved);
  const stat = await fs.stat(resolved);
  if (stat.size > MAX_FILE_BYTES) {
    throw new Error("파일이 너무 커서 미리보기를 지원하지 않습니다.");
  }
  return fs.readFile(resolved, "utf-8");
}

export async function writeRepoFile(relPath: string, content: string): Promise<void> {
  const resolved = path.resolve(REPO_ROOT, relPath);
  assertWithinRepo(resolved);
  await fs.mkdir(path.dirname(resolved), { recursive: true });
  await fs.writeFile(resolved, content, "utf-8");
}

export async function deleteRepoFile(relPath: string): Promise<void> {
  const resolved = path.resolve(REPO_ROOT, relPath);
  assertWithinRepo(resolved);
  await fs.unlink(resolved);
}

export async function runGitCommand(
  req: GitCommandRequest
): Promise<GitCommandResult> {
  if (isDestructive(req) && !req.confirmed) {
    return {
      success: false,
      action: req.action,
      output: "",
      requiresConfirmation: true,
    };
  }

  const g = git();

  try {
    let output = "";

    switch (req.action) {
      case "add": {
        const files = req.files?.length ? req.files : ["."];
        await g.add(files);
        output = `add 완료: ${files.join(", ")}`;
        break;
      }
      case "commit": {
        if (!req.message) throw new Error("커밋 메시지가 필요합니다.");
        if (req.files?.length) await g.add(req.files);
        const result = await g.commit(req.message);
        output = `commit 완료 (${result.commit || "no changes"})\n${JSON.stringify(
          result.summary
        )}`;
        break;
      }
      case "push": {
        const remote = req.remote || "origin";
        const branch = req.branch || (await g.status()).current || "HEAD";
        const result = await g.push(remote, branch, req.force ? ["--force"] : []);
        output = `push 완료: ${remote}/${branch}\n${JSON.stringify(result)}`;
        break;
      }
      case "pull": {
        const remote = req.remote || "origin";
        const branch = req.branch || (await g.status()).current || undefined;
        const result = await g.pull(remote, branch);
        output = `pull 완료: ${remote}${branch ? "/" + branch : ""}\n${JSON.stringify(
          result.summary
        )}`;
        break;
      }
      case "merge": {
        if (!req.branch) throw new Error("병합할 브랜치명이 필요합니다.");
        const result = await g.merge([req.branch]);
        output = `merge 완료: ${req.branch}\n${JSON.stringify(result)}`;
        break;
      }
      case "branch-create": {
        if (!req.branch) throw new Error("브랜치명이 필요합니다.");
        await g.checkoutLocalBranch(req.branch);
        output = `브랜치 생성 및 이동: ${req.branch}`;
        break;
      }
      case "branch-delete": {
        if (!req.branch) throw new Error("브랜치명이 필요합니다.");
        const result = await g.deleteLocalBranch(req.branch, true);
        output = `브랜치 삭제 완료: ${req.branch}\n${JSON.stringify(result)}`;
        break;
      }
      case "checkout": {
        if (!req.branch) throw new Error("브랜치명이 필요합니다.");
        if (req.createBranch) {
          await g.checkoutLocalBranch(req.branch);
        } else {
          await g.checkout(req.branch);
        }
        output = `checkout 완료: ${req.branch}`;
        break;
      }
      default:
        throw new Error(`지원하지 않는 명령입니다: ${req.action}`);
    }

    return { success: true, action: req.action, output };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, action: req.action, output: message };
  }
}

export async function getRemoteOwnerRepo(): Promise<{
  owner: string | null;
  repo: string | null;
}> {
  try {
    const g = git();
    const remotes = await g.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin") ?? remotes[0];
    const url = origin?.refs?.fetch;
    if (!url) return { owner: null, repo: null };

    const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)(\.git)?$/i);
    if (!match) return { owner: null, repo: null };
    return { owner: match[1], repo: match[2] };
  } catch {
    return { owner: null, repo: null };
  }
}
