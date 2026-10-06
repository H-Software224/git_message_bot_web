import { Octokit } from "@octokit/rest";
import { getRemoteOwnerRepo } from "./git";
import type {
  GitHubConfigStatus,
  GitHubIssue,
  GitHubPullRequest,
} from "./types";

const FALLBACK_OWNER = "H-Software224";
const FALLBACK_REPO = "git_message_bot_web";

let cachedContext: { owner: string; repo: string } | null = null;

export function getOctokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
}

export async function getRepoContext(): Promise<GitHubConfigStatus> {
  const token = process.env.GITHUB_TOKEN;

  if (!cachedContext) {
    const envOwner = process.env.GITHUB_OWNER;
    const envRepo = process.env.GITHUB_REPO;

    if (envOwner && envRepo) {
      cachedContext = { owner: envOwner, repo: envRepo };
    } else {
      const remote = await getRemoteOwnerRepo();
      cachedContext = {
        owner: remote.owner ?? FALLBACK_OWNER,
        repo: remote.repo ?? FALLBACK_REPO,
      };
    }
  }

  return {
    configured: Boolean(token),
    owner: cachedContext.owner,
    repo: cachedContext.repo,
  };
}

export async function listIssues(
  state: "open" | "closed" | "all" = "open"
): Promise<{
  status: GitHubConfigStatus;
  issues: GitHubIssue[];
}> {
  const status = await getRepoContext();
  const octokit = getOctokit();
  if (!octokit || !status.owner || !status.repo) {
    return { status, issues: [] };
  }

  const res = await octokit.issues.listForRepo({
    owner: status.owner,
    repo: status.repo,
    state,
    per_page: 30,
  });

  const issues = res.data
    .filter((i) => !i.pull_request)
    .map((i) => ({
      number: i.number,
      title: i.title,
      url: i.html_url,
      state: i.state,
      labels: i.labels.map((l) => (typeof l === "string" ? l : l.name ?? "")),
      author: i.user?.login ?? null,
      createdAt: i.created_at,
    }));

  return { status, issues };
}

export async function listPullRequests(): Promise<{
  status: GitHubConfigStatus;
  pulls: GitHubPullRequest[];
}> {
  const status = await getRepoContext();
  const octokit = getOctokit();
  if (!octokit || !status.owner || !status.repo) {
    return { status, pulls: [] };
  }

  const res = await octokit.pulls.list({
    owner: status.owner,
    repo: status.repo,
    state: "open",
    per_page: 30,
  });

  const pulls = await Promise.all(
    res.data.map(async (p) => {
      let mergeable: boolean | null = null;
      let additions = 0;
      let deletions = 0;
      let changedFiles = 0;
      try {
        const detail = await octokit.pulls.get({
          owner: status.owner!,
          repo: status.repo!,
          pull_number: p.number,
        });
        mergeable = detail.data.mergeable;
        additions = detail.data.additions;
        deletions = detail.data.deletions;
        changedFiles = detail.data.changed_files;
      } catch {
        // ignore detail fetch failures, keep defaults
      }

      return {
        number: p.number,
        title: p.title,
        url: p.html_url,
        state: p.state,
        draft: Boolean(p.draft),
        mergeable,
        reviewDecision: null,
        author: p.user?.login ?? null,
        headBranch: p.head.ref,
        baseBranch: p.base.ref,
        additions,
        deletions,
        changedFiles,
        createdAt: p.created_at,
      };
    })
  );

  return { status, pulls };
}

export async function getLatestWorkflowRun(workflowFile: string) {
  const status = await getRepoContext();
  const octokit = getOctokit();
  if (!octokit || !status.owner || !status.repo) return null;

  try {
    const res = await octokit.actions.listWorkflowRuns({
      owner: status.owner,
      repo: status.repo,
      workflow_id: workflowFile,
      per_page: 1,
    });
    const run = res.data.workflow_runs[0];
    if (!run) return null;
    return {
      status: run.status ?? "unknown",
      conclusion: run.conclusion,
      url: run.html_url,
      createdAt: run.created_at,
    };
  } catch {
    return null;
  }
}
