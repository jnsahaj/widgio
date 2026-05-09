import { Hono, type Context } from "hono";
import { streamSSE } from "hono/streaming";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, normalize, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { bus } from "./bus.ts";
import * as store from "./store.ts";
import type {
  ChunkRequest,
  ShowRequest,
  StartRequest,
  Thread,
  WidgetChunkEvent,
  WidgetCompleteEvent,
  WidgetEndEvent,
  WidgetEvent,
  WidgetMode,
  WidgetStartEvent,
} from "../shared/types.ts";

const here = dirname(fileURLToPath(import.meta.url));
const clientDir = join(here, "client");

let lastActivity = Date.now();
export const touchActivity = () => {
  lastActivity = Date.now();
};
export const getLastActivity = () => lastActivity;

interface Builder {
  id: string;
  title: string;
  mode: WidgetMode;
  rootAttrs?: string;
  chunks: string[];
  createdAt: number;
}
const builders = new Map<string, Builder>();

export function createApp() {
  const app = new Hono();

  app.get("/health", (c) => c.json({ ok: true, lastActivity }));

  app.post("/widgets", async (c) => {
    touchActivity();
    const body = await c.req.json<ShowRequest>();
    const mode = resolveMode(body.code, body.mode);
    const id = await store.uniqueId(slugFromTitle(body.title));
    const now = Date.now();
    const thread: Thread = {
      v: 1,
      id,
      title: body.title,
      mode,
      code: body.code,
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
    await store.saveThread(thread);

    const event: WidgetCompleteEvent = {
      kind: "complete",
      id,
      title: body.title,
      mode,
      code: body.code,
      loadingMessages: body.loadingMessages,
      createdAt: now,
    };
    bus.publish(event);
    return c.json({ ok: true, id });
  });

  app.post("/widgets/start", async (c) => {
    touchActivity();
    const body = await c.req.json<StartRequest>();
    if (!body.id) return c.json({ ok: false, error: "id required" }, 400);
    const id = await store.uniqueId(body.id);
    const now = Date.now();

    builders.set(id, {
      id,
      title: body.title,
      mode: body.mode,
      rootAttrs: body.rootAttrs,
      chunks: [],
      createdAt: now,
    });

    const thread: Thread = {
      v: 1,
      id,
      title: body.title,
      mode: body.mode,
      rootAttrs: body.rootAttrs,
      code: "",
      createdAt: now,
      updatedAt: now,
      archived: false,
    };
    await store.saveThread(thread);

    const event: WidgetStartEvent = {
      kind: "start",
      id,
      title: body.title,
      mode: body.mode,
      rootAttrs: body.rootAttrs,
      loadingMessages: body.loadingMessages,
      createdAt: now,
    };
    bus.publish(event);
    return c.json({ ok: true, id });
  });

  app.post("/widgets/:id/chunk", async (c) => {
    touchActivity();
    const id = c.req.param("id");
    const body = await c.req.json<ChunkRequest>();
    const builder = builders.get(id);
    if (builder) builder.chunks.push(body.code);

    const event: WidgetChunkEvent = {
      kind: "chunk",
      id,
      seq: body.seq ?? bus.nextSeq(id),
      label: body.label,
      code: body.code,
      createdAt: Date.now(),
    };
    bus.publish(event);
    return c.json({ ok: true, seq: event.seq });
  });

  app.post("/widgets/:id/end", async (c) => {
    touchActivity();
    const id = c.req.param("id");
    const builder = builders.get(id);
    if (builder) {
      const code = assembleCode(builder);
      const existing = await store.loadThread(id);
      if (existing) {
        existing.code = code;
        existing.updatedAt = Date.now();
        await store.saveThread(existing);
      }
      builders.delete(id);
    }
    const event: WidgetEndEvent = {
      kind: "end",
      id,
      createdAt: Date.now(),
    };
    bus.publish(event);
    return c.json({ ok: true });
  });

  app.get("/threads", async (c) => {
    const threads = await store.listThreads();
    const inFlight = new Set(builders.keys());
    const summaries = threads.map((t) => store.summarize(t, inFlight));
    return c.json({ threads: summaries });
  });

  app.get("/threads/:id", async (c) => {
    const id = c.req.param("id");
    const thread = await store.loadThread(id);
    if (!thread) return c.json({ ok: false, error: "not found" }, 404);
    return c.json({ thread, inProgress: builders.has(id) });
  });

  app.post("/threads/:id/archive", async (c) => {
    const id = c.req.param("id");
    const body = await c.req
      .json<{ archived?: boolean }>()
      .catch(() => ({}) as { archived?: boolean });
    const archived = body.archived ?? true;
    const t = await store.setArchived(id, archived);
    if (!t) return c.json({ ok: false, error: "not found" }, 404);
    return c.json({ ok: true, archived: t.archived });
  });

  app.delete("/threads/:id", async (c) => {
    const id = c.req.param("id");
    const ok = await store.deleteThread(id);
    if (!ok) return c.json({ ok: false, error: "not found" }, 404);
    builders.delete(id);
    return c.json({ ok: true });
  });

  // Static UI: serves the built Vite app (index.html + assets/*).
  // In dev (`vite dev`), Vite proxies API requests here, so this is unused.
  app.get("/assets/*", async (c) => serveStatic(c, c.req.path));
  app.get("/favicon.ico", async (c) => serveStatic(c, "/favicon.ico"));
  app.get("/", async (c) => serveStatic(c, "/index.html"));

  app.get("/events", (c) => {
    touchActivity();
    return streamSSE(c, async (stream) => {
      const handler = async (event: WidgetEvent) => {
        await stream.writeSSE({ event: "widget", data: JSON.stringify(event) });
      };
      bus.on("event", handler);
      const ping = setInterval(
        () => stream.writeSSE({ event: "ping", data: "" }).catch(() => {}),
        15000
      );
      await new Promise<void>((resolve) => {
        stream.onAbort(() => {
          bus.off("event", handler);
          clearInterval(ping);
          resolve();
        });
      });
    });
  });

  // SPA fallback: thread paths (and any other unknown GET) → index.html
  // so deep links like /t/<id> work on hard reload.
  app.get("/t/*", async (c) => serveStatic(c, "/index.html"));
  app.get("*", async (c) => serveStatic(c, "/index.html"));

  return app;
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

async function serveStatic(c: Context, reqPath: string) {
  const safe = normalize(reqPath).replace(/^\/+/, "");
  const full = pathResolve(clientDir, safe);
  if (!full.startsWith(clientDir)) return c.notFound();
  if (!existsSync(full)) {
    const indexPath = join(clientDir, "index.html");
    if (!existsSync(indexPath)) {
      return c.text(
        "widgio: UI not built. Run `pnpm build:web` (or `pnpm dev:web` for dev).",
        404
      );
    }
    return c.html(await readFile(indexPath, "utf8"));
  }
  const stats = await stat(full);
  if (stats.isDirectory()) {
    const indexPath = join(full, "index.html");
    if (existsSync(indexPath)) {
      return c.html(await readFile(indexPath, "utf8"));
    }
    return c.notFound();
  }
  const ext = full.slice(full.lastIndexOf("."));
  const mime = MIME[ext] ?? "application/octet-stream";
  const buf = await readFile(full);
  return c.body(buf, 200, { "content-type": mime });
}

function resolveMode(code: string, hint?: WidgetMode | "auto"): WidgetMode {
  if (hint && hint !== "auto") return hint;
  return code.trimStart().startsWith("<svg") ? "svg" : "html";
}

function slugFromTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "widget";
}

function assembleCode(b: Builder): string {
  const joined = b.chunks.join("\n");
  if (b.mode === "svg") {
    const attrs = b.rootAttrs || `viewBox="0 0 680 400" xmlns="http://www.w3.org/2000/svg"`;
    return `<svg ${attrs}>\n${joined}\n</svg>`;
  }
  return joined;
}
