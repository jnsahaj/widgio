# widgio

Stream animated SVG/HTML widgets from terminal agents to a browser companion.

The agent (Claude Code, Codex, or any agent that can run shell commands)
emits a widget via the `widgio` CLI. A small local daemon receives it and
pushes it via SSE to a browser tab open at `http://127.0.0.1:4242`. CSS
animations carry the "drawing in" feel.

## Status

MVP. SVG and HTML modes work. `sendPrompt` round-trip is stubbed for v2.

## Quick start

One command — installs the CLI and walks you through wiring it up to your
agent (Claude Code and/or Codex):

```bash
npx widgio setup
```

That command:

1. Detects which agents are on your `$PATH`.
2. Asks which to install for.
3. For Codex, copies the skill to `~/.agents/skills/widgio/`.
4. For Claude Code, prints the two `/plugin` commands to paste inside Claude.

Or non-interactive flags:

```bash
npx widgio setup --all              # both agents
npx widgio setup --codex            # Codex only
npx widgio setup --claude           # Claude commands only
npx widgio setup --codex --repo     # Codex skill in ./.agents (this repo only)
```

The `widgio` CLI itself is the npx entrypoint, so you also get every other
command (`widgio show`, `widgio open`, etc.) without a global install.

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

`widgio setup --codex` copies `SKILL.md` to `~/.agents/skills/widgio/`.
Verify Codex picked it up:

```bash
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
