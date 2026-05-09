# widgio

Stream animated SVG/HTML widgets from terminal agents to a browser companion.

The agent (Claude Code, Codex, or any agent that can run shell commands)
emits a widget via the `widgio` CLI. A small local daemon receives it and
pushes it via SSE to a browser tab open at `http://127.0.0.1:4242`. CSS
animations carry the "drawing in" feel.

## Status

MVP. SVG and HTML modes work. `sendPrompt` round-trip is stubbed for v2.

## Quick start

One command — installs the CLI globally and walks you through wiring it up
to your agent:

```bash
npx widgio setup
```

That command:

1. **Installs `widgio` globally** if it's not on your `$PATH` yet (asks
   first; uses whichever package manager invoked `npx` — npm/pnpm/yarn/bun).
   This matters: agents shell out to `widgio` directly, and going through
   `npx` every call is slow.
2. Detects which agents are on your `$PATH`.
3. For Claude Code: prints the `/plugin marketplace add` lines to paste.
4. For Codex: prints the `codex plugin marketplace add` line to run, or
   (with `--skill-only`) drops the skill into `~/.agents/skills/widgio/`.

Non-interactive flags:

```bash
npx widgio setup --all                 # both agents, prompts for global install
npx widgio setup --all --install       # both agents, skip the install prompt
npx widgio setup --codex --skill-only  # Codex skill-only, no marketplace
npx widgio setup --no-install          # skip global install, just print agent steps
```

If you'd rather install widgio explicitly first:

```bash
npm i -g widgio    # or: pnpm add -g widgio / yarn global add widgio / bun add -g widgio
widgio setup
```

## Use it

```bash
widgio show --title hello --loading "rendering" <<'EOF'
<svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
  <text x="340" y="100" text-anchor="middle" font-size="24">Hello widgio</text>
</svg>
EOF

widgio open                          # open the browser feed
widgio read-me --module diagram      # design system reference
widgio status
widgio stop
```

The first `widgio show` auto-spawns a detached daemon. It idle-shuts after
30 minutes of no activity.

## Agent integration

### Claude Code

This repo is a Claude Code plugin marketplace. Inside Claude Code:

```text
/plugin marketplace add jnsahaj/widgio
/plugin install widgio@widgio
```

(`widgio setup` prints these for you.)

To install from a local checkout instead:

```text
/plugin install /absolute/path/to/widgio/plugin
```

### Codex CLI

This repo is a Codex plugin marketplace too. `widgio setup --codex` prints:

```bash
codex plugin marketplace add jnsahaj/widgio
```

Run it in your terminal — Codex installs the plugin (which bundles the
skill) and picks it up on next launch.

Skill-only fallback (no marketplace add, just drops `SKILL.md` into
`~/.agents/skills/widgio/`):

```bash
widgio setup --codex --skill-only
codex skills list | grep widgio
```

### Other agents

The CLI is the universal interface — any agent that can run shell commands
can use widgio. Point it at `plugin/skills/widgio/SKILL.md` (plain markdown,
no Claude- or OpenAI-specific syntax) and ensure `widgio` is on `$PATH`.

## Architecture

```
agent --[shell]--> widgio CLI --[http]--> daemon --[sse]--> browser
                                              ^
                                              |
                              (fixed port 4242, falls back if taken)
```

- **Daemon**: Hono HTTP server on `127.0.0.1`. Auto-spawned on first call.
- **Daemon state**: `~/.widgio/server.json` (pid, port, url).
- **Threads**: `~/.widgio/threads/<id>.json` — one file per widget, plain JSON.
- **Idle shutdown**: 30 min after last activity.

## Development

```bash
pnpm install
pnpm build              # esbuild CLI + Vite web → dist/
pnpm typecheck
pnpm dev:web            # Vite dev server with proxy to the running daemon
```

Local install (for hacking):

```bash
ln -s "$(pwd)/dist/cli.js" /usr/local/bin/widgio
chmod +x dist/cli.js
```
