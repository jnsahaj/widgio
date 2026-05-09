import { spawn } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, openSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { SERVER_INFO_PATH, SERVER_LOG_PATH, WIDGIO_DIR } from "../shared/paths.ts";
import type { ServerInfo } from "../shared/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = resolve(here, "server-entry.js");

export async function getServerInfo(): Promise<ServerInfo | null> {
  if (!existsSync(SERVER_INFO_PATH)) return null;
  try {
    const info = JSON.parse(await readFile(SERVER_INFO_PATH, "utf8")) as ServerInfo;
    if (!(await pingHealth(info.url))) return null;
    return info;
  } catch {
    return null;
  }
}

export async function ensureServer(): Promise<ServerInfo> {
  const existing = await getServerInfo();
  if (existing) return existing;

  await mkdir(WIDGIO_DIR, { recursive: true });
  const out = openSync(SERVER_LOG_PATH, "a");
  const child = spawn(process.execPath, [SERVER_ENTRY], {
    detached: true,
    stdio: ["ignore", out, out],
    env: { ...process.env },
  });
  child.unref();

  for (let i = 0; i < 50; i++) {
    await sleep(100);
    const info = await getServerInfo();
    if (info) return info;
  }
  throw new Error("widgio server failed to start; see " + SERVER_LOG_PATH);
}

async function pingHealth(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(500) });
    return res.ok;
  } catch {
    return false;
  }
}
