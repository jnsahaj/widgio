import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { THREADS_DIR } from "../shared/paths.ts";
import type { Thread, ThreadSummary } from "../shared/types.ts";

async function ensureDir() {
  await mkdir(THREADS_DIR, { recursive: true });
}

export function sanitizeId(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80);
  return cleaned.replace(/^-+|-+$/g, "") || "thread";
}

function pathFor(id: string): string {
  return join(THREADS_DIR, `${sanitizeId(id)}.json`);
}

export async function uniqueId(base: string): Promise<string> {
  await ensureDir();
  const sanitized = sanitizeId(base);
  if (!existsSync(pathFor(sanitized))) return sanitized;
  let n = 2;
  while (existsSync(pathFor(`${sanitized}-${n}`))) n++;
  return `${sanitized}-${n}`;
}

export async function saveThread(t: Thread): Promise<void> {
  await ensureDir();
  await writeFile(pathFor(t.id), JSON.stringify(t, null, 2));
}

export async function loadThread(id: string): Promise<Thread | null> {
  const path = pathFor(id);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(await readFile(path, "utf8")) as Thread;
  } catch {
    return null;
  }
}

export async function listThreads(): Promise<Thread[]> {
  await ensureDir();
  const entries = await readdir(THREADS_DIR);
  const out: Thread[] = [];
  for (const name of entries) {
    if (!name.endsWith(".json")) continue;
    try {
      const raw = await readFile(join(THREADS_DIR, name), "utf8");
      out.push(JSON.parse(raw) as Thread);
    } catch {
      // skip corrupt
    }
  }
  out.sort((a, b) => b.updatedAt - a.updatedAt);
  return out;
}

export async function setArchived(id: string, archived: boolean): Promise<Thread | null> {
  const t = await loadThread(id);
  if (!t) return null;
  t.archived = archived;
  t.updatedAt = Date.now();
  await saveThread(t);
  return t;
}

export async function deleteThread(id: string): Promise<boolean> {
  const path = pathFor(id);
  if (!existsSync(path)) return false;
  await unlink(path);
  return true;
}

export function summarize(t: Thread, inProgressIds: Set<string>): ThreadSummary {
  return {
    id: t.id,
    title: t.title,
    mode: t.mode,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    archived: t.archived,
    inProgress: inProgressIds.has(t.id),
  };
}
