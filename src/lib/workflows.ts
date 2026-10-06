import { promises as fs } from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import { REPO_ROOT } from "./git";
import { getLatestWorkflowRun } from "./github";
import type { WorkflowScheduleInfo } from "./types";

interface WorkflowYaml {
  name?: string;
  on?: unknown;
}

function extractCrons(on: unknown): string[] {
  if (!on || typeof on !== "object") return [];
  const schedule = (on as Record<string, unknown>).schedule;
  if (!Array.isArray(schedule)) return [];
  return schedule
    .map((entry) =>
      entry && typeof entry === "object" ? (entry as Record<string, unknown>).cron : null
    )
    .filter((cron): cron is string => typeof cron === "string");
}

export async function getWorkflowSchedules(): Promise<WorkflowScheduleInfo[]> {
  const workflowsDir = path.join(REPO_ROOT, ".github", "workflows");

  let files: string[] = [];
  try {
    files = (await fs.readdir(workflowsDir)).filter(
      (f) => f.endsWith(".yml") || f.endsWith(".yaml")
    );
  } catch {
    return [];
  }

  const results: WorkflowScheduleInfo[] = [];

  for (const file of files) {
    const fullPath = path.join(workflowsDir, file);
    const raw = await fs.readFile(fullPath, "utf-8");
    let parsed: WorkflowYaml;
    try {
      parsed = (loadYaml(raw) as WorkflowYaml) ?? {};
    } catch {
      continue;
    }

    const crons = extractCrons(parsed.on);
    const lastRun = await getLatestWorkflowRun(file);

    results.push({
      name: parsed.name ?? file,
      file,
      crons,
      lastRun,
    });
  }

  return results;
}
