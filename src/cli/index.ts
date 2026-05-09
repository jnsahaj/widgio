import { chunk, end, openBrowser, readMe, show, start, status, stop } from "./commands.ts";
import { setup } from "./setup.ts";
import type { WidgetMode } from "../shared/types.ts";

const HELP = `widgio — stream widgets to a browser companion

usage:
  widgio show --title <name> [--loading <msg>]... [--mode auto|svg|html] [--open]
              < widget.svg
  widgio start --id <id> --title <name> --mode svg|html
              [--viewBox "0 0 680 400"] [--root '<attrs>']
              [--loading <msg>]... [--open]
  widgio chunk [--id <id>] [--label <desc>] [--seq <n>]
              < chunk-fragment
  widgio end [--id <id>]
  widgio read-me [--module <name>]...     # default: diagram
  widgio open                              # open browser to feed
  widgio status                            # show daemon status
  widgio stop                              # stop the daemon
  widgio setup [--claude] [--codex] [--skill-only] [--repo]
                                          # install plugin/skill into your agent

examples (one-shot):
  widgio show --title oauth_flow <<'EOF'
  <svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg">...</svg>
  EOF

examples (streaming, semantic chunks):
  widgio start --id oauth_flow --title oauth_flow --mode svg \\
              --viewBox "0 0 680 320" --loading "drawing flow"

  widgio chunk --label "skeleton + columns" <<'EOF'
  <g id="cols">...</g>
  EOF

  widgio chunk --label "actor nodes" <<'EOF'
  <g id="actors">...</g>
  EOF

  widgio chunk --label "request edges" <<'EOF'
  <g id="edges">...</g>
  EOF

  widgio end
`;

async function main() {
  const [, , cmd, ...rest] = process.argv;

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    process.stdout.write(HELP);
    return;
  }

  switch (cmd) {
    case "show": {
      const args = parseShowArgs(rest);
      const code = await readStdin();
      await show(args, code);
      return;
    }
    case "start": {
      const args = parseStartArgs(rest);
      await start(args);
      return;
    }
    case "chunk": {
      const args = parseChunkArgs(rest);
      const code = await readStdin();
      await chunk(args, code);
      return;
    }
    case "end": {
      const args = parseEndArgs(rest);
      await end(args);
      return;
    }
    case "read-me": {
      const modules = parseFlagArray(rest, "--module");
      process.stdout.write(await readMe(modules));
      return;
    }
    case "setup": {
      const args = parseSetupArgs(rest);
      await setup(args);
      return;
    }
    case "open":
      await openBrowser();
      return;
    case "status":
      process.stdout.write(`${await status()}\n`);
      return;
    case "stop":
      process.stdout.write(`${await stop()}\n`);
      return;
    default:
      process.stderr.write(`unknown command: ${cmd}\n${HELP}`);
      process.exit(2);
  }
}

function parseShowArgs(argv: string[]) {
  let title = "";
  const loadingMessages: string[] = [];
  let mode: WidgetMode | "auto" | undefined;
  let openFlag = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--title") title = argv[++i] ?? "";
    else if (a === "--loading") loadingMessages.push(argv[++i] ?? "");
    else if (a === "--mode") mode = (argv[++i] as WidgetMode | "auto") ?? "auto";
    else if (a === "--open") openFlag = true;
    else throw new Error(`unknown flag: ${a}`);
  }
  return { title, loadingMessages, mode, open: openFlag };
}

function parseStartArgs(argv: string[]) {
  let id = "";
  let title = "";
  let mode: WidgetMode | undefined;
  let viewBox: string | undefined;
  let rootAttrs: string | undefined;
  const loadingMessages: string[] = [];
  let openFlag = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") id = argv[++i] ?? "";
    else if (a === "--title") title = argv[++i] ?? "";
    else if (a === "--mode") mode = (argv[++i] as WidgetMode) ?? undefined;
    else if (a === "--viewBox" || a === "--viewbox") viewBox = argv[++i];
    else if (a === "--root") rootAttrs = argv[++i];
    else if (a === "--loading") loadingMessages.push(argv[++i] ?? "");
    else if (a === "--open") openFlag = true;
    else throw new Error(`unknown flag: ${a}`);
  }
  if (!mode) mode = viewBox || rootAttrs ? "svg" : "html";
  return { id, title, mode, viewBox, rootAttrs, loadingMessages, open: openFlag };
}

function parseChunkArgs(argv: string[]) {
  let id: string | undefined;
  let label: string | undefined;
  let seq: number | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") id = argv[++i];
    else if (a === "--label") label = argv[++i];
    else if (a === "--seq") seq = Number(argv[++i]);
    else throw new Error(`unknown flag: ${a}`);
  }
  return { id, label, seq };
}

function parseEndArgs(argv: string[]) {
  let id: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") id = argv[++i];
    else throw new Error(`unknown flag: ${a}`);
  }
  return { id };
}

function parseSetupArgs(argv: string[]): {
  claude?: boolean;
  codex?: boolean;
  codexMode?: "plugin" | "skill";
  scope?: "user" | "repo";
} {
  let claude: boolean | undefined;
  let codex: boolean | undefined;
  let codexMode: "plugin" | "skill" | undefined;
  let scope: "user" | "repo" | undefined;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--claude") claude = true;
    else if (a === "--no-claude") claude = false;
    else if (a === "--codex") codex = true;
    else if (a === "--no-codex") codex = false;
    else if (a === "--all") {
      claude = true;
      codex = true;
    } else if (a === "--skill-only") codexMode = "skill";
    else if (a === "--plugin") codexMode = "plugin";
    else if (a === "--repo") scope = "repo";
    else if (a === "--user") scope = "user";
    else throw new Error(`unknown flag: ${a}`);
  }
  return { claude, codex, codexMode, scope };
}

function parseFlagArray(argv: string[], flag: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === flag) {
      const v = argv[++i];
      if (v) out.push(v);
    }
  }
  return out;
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return "";
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

main().catch((err) => {
  process.stderr.write(`widgio: ${(err as Error).message}\n`);
  process.exit(1);
});
