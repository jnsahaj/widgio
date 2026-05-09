import { serve } from "@hono/node-server";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { createApp, getLastActivity } from "./app.ts";
import { findFreePort } from "./port.ts";
import { SERVER_INFO_PATH, WIDGIO_DIR } from "../shared/paths.ts";
import type { ServerInfo } from "../shared/types.ts";

const IDLE_SHUTDOWN_MS = 30 * 60 * 1000;
const IDLE_CHECK_MS = 60 * 1000;

async function main() {
  await mkdir(WIDGIO_DIR, { recursive: true });
  const startPort = Number(process.env.WIDGIO_PORT ?? 4242);
  const port = await findFreePort(startPort);
  const app = createApp();

  const server = serve({ fetch: app.fetch, port, hostname: "127.0.0.1" });
  const info: ServerInfo = {
    pid: process.pid,
    port,
    url: `http://127.0.0.1:${port}`,
    startedAt: Date.now(),
  };
  await writeFile(SERVER_INFO_PATH, JSON.stringify(info, null, 2));
  console.log(`widgio listening on ${info.url}`);

  const idleTimer = setInterval(async () => {
    if (Date.now() - getLastActivity() > IDLE_SHUTDOWN_MS) {
      console.log("widgio idle shutdown");
      clearInterval(idleTimer);
      await cleanup();
      server.close(() => process.exit(0));
    }
  }, IDLE_CHECK_MS);

  const shutdown = async () => {
    clearInterval(idleTimer);
    await cleanup();
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

async function cleanup() {
  try {
    await unlink(SERVER_INFO_PATH);
  } catch {
    // ignore
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
