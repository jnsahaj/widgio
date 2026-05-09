import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import open from "open";
import { ensureServer, getServerInfo } from "./daemon.ts";
import { LAST_ID_PATH, SERVER_INFO_PATH } from "../shared/paths.ts";
import type {
  ChunkRequest,
  ShowRequest,
  StartRequest,
  WidgetMode,
} from "../shared/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const designSystemDir = resolve(here, "design-system");

export interface ShowArgs {
  title: string;
  loadingMessages: string[];
  mode?: WidgetMode | "auto";
  open?: boolean;
}

export interface StartArgs {
  id: string;
  title: string;
  mode: WidgetMode;
  viewBox?: string;
  rootAttrs?: string;
  loadingMessages: string[];
  open?: boolean;
}

export interface ChunkArgs {
  id?: string;
  label?: string;
  seq?: number;
}

export interface EndArgs {
  id?: string;
}

export async function show(args: ShowArgs, code: string): Promise<void> {
  if (!args.title) throw new Error("--title is required");
  if (!code.trim()) throw new Error("widget code is empty (pipe via stdin)");

  const info = await ensureServer();
  const body: ShowRequest = {
    title: args.title,
    code,
    loadingMessages: args.loadingMessages.length ? args.loadingMessages : ["rendering"],
    mode: args.mode ?? "auto",
  };
  const res = await fetch(`${info.url}/widgets`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  const json = (await res.json()) as { id: string };

  const url = `${info.url}/t/${json.id}`;
  process.stdout.write(`widgio: rendered '${args.title}' (${url})\n`);

  if (args.open) await open(info.url);
}

export async function start(args: StartArgs): Promise<void> {
  if (!args.id) throw new Error("--id is required");
  if (!args.title) throw new Error("--title is required");

  const info = await ensureServer();
  const rootAttrs = buildRootAttrs(args);
  const body: StartRequest = {
    id: args.id,
    title: args.title,
    mode: args.mode,
    rootAttrs,
    loadingMessages: args.loadingMessages.length ? args.loadingMessages : ["building"],
  };
  const res = await fetch(`${info.url}/widgets/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  const json = (await res.json()) as { id: string };
  const canonicalId = json.id;

  await writeLastId(canonicalId);
  const note = canonicalId === args.id ? "" : ` (id collision → ${canonicalId})`;
  process.stdout.write(`widgio: started '${args.title}' (id=${canonicalId})${note}\n`);
  if (args.open) await open(info.url);
}

export async function chunk(args: ChunkArgs, code: string): Promise<void> {
  if (!code.trim()) throw new Error("chunk code is empty (pipe via stdin)");
  const id = args.id ?? (await readLastId());
  if (!id) throw new Error("--id is required (no prior `widgio start` in this session)");

  const info = await ensureServer();
  const body: ChunkRequest = {
    code,
    label: args.label,
    seq: args.seq,
  };
  const res = await fetch(`${info.url}/widgets/${encodeURIComponent(id)}/chunk`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  const json = (await res.json()) as { seq: number };
  const labelStr = args.label ? ` (${args.label})` : "";
  process.stdout.write(`widgio: chunk #${json.seq} → ${id}${labelStr}\n`);
}

export async function end(args: EndArgs): Promise<void> {
  const id = args.id ?? (await readLastId());
  if (!id) throw new Error("--id is required (no prior `widgio start` in this session)");

  const info = await ensureServer();
  const res = await fetch(`${info.url}/widgets/${encodeURIComponent(id)}/end`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`server returned ${res.status}`);
  process.stdout.write(`widgio: sealed ${id}\n`);
}

export async function readMe(modules: string[]): Promise<string> {
  const requested = modules.length ? modules : ["diagram"];
  // Always prepend `core` (universal rules + design tokens + palette) — unless explicitly requested
  // alone, in which case we just return it once.
  const explicit = requested.filter((m) => m !== "core");
  const ordered = ["core", ...explicit];
  const parts: string[] = [];
  for (const m of ordered) {
    const path = join(designSystemDir, `${m}.md`);
    try {
      parts.push(await readFile(path, "utf8"));
    } catch {
      parts.push(`<!-- module '${m}' not found -->`);
    }
  }
  return parts.join("\n\n---\n\n");
}

export async function status(): Promise<string> {
  const info = await getServerInfo();
  if (!info) return "widgio: not running";
  return `widgio: running pid=${info.pid} port=${info.port} url=${info.url}`;
}

export async function openBrowser(): Promise<void> {
  const info = await ensureServer();
  await open(info.url);
  process.stdout.write(`widgio: opened ${info.url}\n`);
}

export async function stop(): Promise<string> {
  const info = await getServerInfo();
  if (!info) return "widgio: not running";
  try {
    process.kill(info.pid, "SIGTERM");
    return `widgio: stopped pid=${info.pid}`;
  } catch (e) {
    return `widgio: stop failed: ${(e as Error).message}`;
  }
}

function buildRootAttrs(args: StartArgs): string | undefined {
  if (args.mode !== "svg") return undefined;
  if (args.rootAttrs) return args.rootAttrs;
  const viewBox = args.viewBox ?? "0 0 680 400";
  return `viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"`;
}

async function writeLastId(id: string): Promise<void> {
  try {
    await writeFile(LAST_ID_PATH, JSON.stringify({ id, ts: Date.now() }));
  } catch {
    // best effort
  }
}

async function readLastId(): Promise<string | null> {
  if (!existsSync(LAST_ID_PATH)) return null;
  try {
    const raw = await readFile(LAST_ID_PATH, "utf8");
    const { id } = JSON.parse(raw) as { id: string };
    return id || null;
  } catch {
    return null;
  }
}

export const SERVER_INFO_PATH_FOR_TEST = SERVER_INFO_PATH;
