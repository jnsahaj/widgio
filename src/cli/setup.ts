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

export interface SetupOpts {
  claude?: boolean;
  codex?: boolean;
  yes?: boolean;
  scope?: "user" | "repo";
}

export async function setup(opts: SetupOpts): Promise<void> {
  const detected = detectAgents();

  let { claude, codex } = opts;
  if (claude === undefined && codex === undefined) {
    const choice = await promptChoice(detected);
    claude = choice.claude;
    codex = choice.codex;
  }

  if (codex) {
    await installCodexSkill(opts.scope ?? "user");
  }
  if (claude) {
    printClaudeInstructions();
  }
  if (!claude && !codex) {
    process.stdout.write("widgio setup: nothing selected. re-run with --claude, --codex, or interactively.\n");
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
