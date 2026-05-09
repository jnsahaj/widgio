import { build as esbuild } from "esbuild";
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dist = join(root, "dist");

async function buildCli() {
  await mkdir(dist, { recursive: true });
  await mkdir(join(dist, "design-system"), { recursive: true });

  await esbuild({
    entryPoints: [join(root, "src/cli/index.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    outfile: join(dist, "cli.js"),
    external: [],
    banner: {
      js: "#!/usr/bin/env node\nimport { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);",
    },
  });

  await esbuild({
    entryPoints: [join(root, "src/server/index.ts")],
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node22",
    outfile: join(dist, "server-entry.js"),
    banner: {
      js: "import { createRequire as _cr } from 'module'; const require = _cr(import.meta.url);",
    },
  });

  await cp(join(root, "design-system"), join(dist, "design-system"), { recursive: true });

  const cliPath = join(dist, "cli.js");
  const cli = await readFile(cliPath, "utf8");
  await writeFile(cliPath, cli, { mode: 0o755 });
}

function buildWeb(): Promise<void> {
  return new Promise((res, rej) => {
    const p = spawn("pnpm", ["exec", "vite", "build", "--config", "web/vite.config.ts"], {
      cwd: root,
      stdio: "inherit",
    });
    p.on("exit", (code) => (code === 0 ? res() : rej(new Error(`vite build exit ${code}`))));
  });
}

await Promise.all([buildCli(), buildWeb()]);
console.log("built widgio → dist/");
