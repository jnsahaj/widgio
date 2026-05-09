import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SKILL_SRC = resolve(here, "skill");

const CLAUDE_INSTRUCTIONS = [
  "/plugin marketplace add jnsahaj/widgio",
  "/plugin install widgio@widgio",
];

const CODEX_PLUGIN_INSTRUCTIONS = [
  "codex plugin marketplace add jnsahaj/widgio",
];

export type CodexMode = "plugin" | "skill";

export interface SetupOpts {
  claude?: boolean;
  codex?: boolean;
  codexMode?: CodexMode;
  yes?: boolean;
  scope?: "user" | "repo";
  /** Force / skip the global-install prompt. Default: prompt. */
  globalInstall?: boolean;
}

export async function setup(opts: SetupOpts): Promise<void> {
  const detected = detectAgents();

  await ensureCliOnPath(opts.globalInstall);

  let { claude, codex } = opts;
  if (claude === undefined && codex === undefined) {
    const choice = await promptChoice(detected);
    claude = choice.claude;
    codex = choice.codex;
  }

  if (codex) {
    if ((opts.codexMode ?? "plugin") === "skill") {
      await installCodexSkill(opts.scope ?? "user");
    } else {
      printCodexInstructions();
    }
  }
  if (claude) {
    printClaudeInstructions();
  }
  if (!claude && !codex) {
    process.stdout.write("widgio setup: nothing selected. re-run with --claude, --codex, or interactively.\n");
  }
}

type Pm = "npm" | "pnpm" | "yarn" | "bun";

function detectPm(): Pm {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

function pmInstallCmd(pm: Pm): { cmd: string; args: string[] } {
  switch (pm) {
    case "pnpm": return { cmd: "pnpm", args: ["add", "-g", "widgio"] };
    case "yarn": return { cmd: "yarn", args: ["global", "add", "widgio"] };
    case "bun": return { cmd: "bun", args: ["add", "-g", "widgio"] };
    case "npm": return { cmd: "npm", args: ["install", "-g", "widgio"] };
  }
}

/**
 * Make sure a globally-installed `widgio` exists on $PATH. The caller might be
 * running us via `npx widgio setup` (which puts us in npm's cache, not on
 * $PATH), but agents shell out to `widgio` directly — so without a real global
 * install, every agent call would re-fetch via npx.
 */
async function ensureCliOnPath(force?: boolean): Promise<void> {
  if (hasOnPath("widgio")) return;

  const pm = detectPm();
  const { cmd, args } = pmInstallCmd(pm);

  let go = force;
  if (go === undefined) {
    const rl = createInterface({ input: stdin, output: stdout });
    try {
      process.stdout.write("\nwidgio is not on your $PATH globally.\n");
      process.stdout.write(
        "agents shell out to `widgio` directly — without a global install,\n"
      );
      process.stdout.write("they'd have to go through npx every call (slow).\n\n");
      go = await yesNo(rl, `install globally with \`${cmd} ${args.join(" ")}\`?`, true);
    } finally {
      rl.close();
    }
  }

  if (!go) {
    process.stdout.write(`skipped. install later with: ${cmd} ${args.join(" ")}\n\n`);
    return;
  }

  process.stdout.write(`\n→ ${cmd} ${args.join(" ")}\n`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.stdout.write(
      `\n⚠ \`${cmd} ${args.join(" ")}\` failed (exit ${result.status ?? "?"}).\n`
    );
    process.stdout.write("  agents won't find widgio until this is resolved.\n\n");
    return;
  }
  if (hasOnPath("widgio")) {
    process.stdout.write("✓ widgio installed globally\n\n");
  } else {
    process.stdout.write(
      "⚠ install completed but widgio still not on $PATH — check your shell's PATH for the global bin dir.\n\n"
    );
  }
}

function detectAgents(): { claude: boolean; codex: boolean } {
  return { claude: hasOnPath("claude"), codex: hasOnPath("codex") };
}

function hasOnPath(cmd: string): boolean {
  const path = process.env.PATH ?? "";
  const sep = process.platform === "win32" ? ";" : ":";
  for (const dir of path.split(sep)) {
    if (!dir) continue;
    if (existsSync(join(dir, cmd))) return true;
  }
  return false;
}

async function promptChoice(detected: { claude: boolean; codex: boolean }): Promise<{
  claude: boolean;
  codex: boolean;
}> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    process.stdout.write("\nwidgio setup\n");
    process.stdout.write("teaches your agent when to call widgio.\n\n");

    const detectedNames = [
      detected.claude && "Claude Code",
      detected.codex && "Codex",
    ].filter(Boolean) as string[];
    if (detectedNames.length) {
      process.stdout.write(`detected on $PATH: ${detectedNames.join(", ")}\n\n`);
    }

    const claude = await yesNo(rl, "install for Claude Code?", detected.claude);
    const codex = await yesNo(rl, "install for Codex?", detected.codex);
    return { claude, codex };
  } finally {
    rl.close();
  }
}

async function yesNo(
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultYes: boolean
): Promise<boolean> {
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = (await rl.question(`${question} ${hint} `)).trim().toLowerCase();
  if (answer === "") return defaultYes;
  return answer === "y" || answer === "yes";
}

async function installCodexSkill(scope: "user" | "repo"): Promise<void> {
  const root = scope === "repo" ? process.cwd() : homedir();
  const dest = join(root, ".agents/skills/widgio");

  if (!existsSync(SKILL_SRC)) {
    throw new Error(`widgio: skill source missing at ${SKILL_SRC} (build artefact incomplete)`);
  }

  await mkdir(dirname(dest), { recursive: true });
  if (existsSync(dest)) await rm(dest, { recursive: true });
  await cp(SKILL_SRC, dest, { recursive: true });

  process.stdout.write(`✓ Codex: skill installed at ${dest}\n`);
  process.stdout.write("  verify with: codex skills list | grep widgio\n");
}

function printClaudeInstructions(): void {
  process.stdout.write("\nClaude Code: paste these inside Claude Code (interactive only):\n\n");
  for (const cmd of CLAUDE_INSTRUCTIONS) process.stdout.write(`  ${cmd}\n`);
  process.stdout.write("\n");
}

function printCodexInstructions(): void {
  process.stdout.write("\nCodex: run this in your terminal to install the widgio plugin:\n\n");
  for (const cmd of CODEX_PLUGIN_INSTRUCTIONS) process.stdout.write(`  ${cmd}\n`);
  process.stdout.write(
    "\n  (skill-only fallback: rerun with `widgio setup --codex --skill-only`)\n\n"
  );
}
