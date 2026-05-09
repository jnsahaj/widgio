# widgio

Stream animated SVG/HTML widgets from terminal agents to a browser companion.

The agent (Claude Code, Codex, or any agent that can run shell commands)
emits a widget via the `widgio` CLI. A small local daemon receives it and
pushes it via SSE to a browser tab open at `http://127.0.0.1:4242`. CSS
animations carry the "drawing in" feel.

## Status

MVP. SVG and HTML modes work. `sendPrompt` round-trip is stubbed for v2.

## Install

```bash
pnpm install
pnpm build
# Symlink the CLI:
ln -s "$(pwd)/dist/cli.js" /usr/local/bin/widgio
chmod +x dist/cli.js
```

## Usage

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

The `widgio` CLI must be on `$PATH` first (see Install above). Agents call it
via shell. The repo ships skill metadata for two agents today:

### Claude Code

This repo is a Claude Code plugin marketplace. Install the plugin with:

```text
# inside Claude Code:
/plugin marketplace add jnsahaj/widgio
/plugin install widgio@widgio
```

This loads `plugin/skills/widgio/SKILL.md` — Claude reads it when it
detects a request that benefits from a visual.

To install from a local checkout instead:

```bash
/plugin install /absolute/path/to/widgio/plugin
```

### Codex CLI

Codex reads skills from `~/.agents/skills/<name>/SKILL.md`. The same
`SKILL.md` file works as-is — copy it once:

```bash
./scripts/install-codex.sh           # installs to ~/.agents/skills/widgio
./scripts/install-codex.sh --repo    # installs to ./.agents/skills/widgio (current project only)
```

Verify Codex picked it up:

```bash
codex skills list | grep widgio
```

### Other agents

The CLI is the universal interface — any agent that can run shell commands
can use widgio. Point it at `plugin/skills/widgio/SKILL.md` (the file is
plain markdown, no Claude- or OpenAI-specific syntax) and ensure `widgio`
is on `$PATH`.

## Architecture

```
agent --[shell]--> widgio CLI --[http]--> daemon --[sse]--> browser
                                              ^
                                              |
                              (fixed port 4242, falls back if taken)
```

- **Daemon**: Hono HTTP server on `127.0.0.1`. Auto-spawned on first call.
- **Daemon state**: `~/.widgio/server.json` (pid, port, url).
- **Idle shutdown**: 30 min after last activity.
- **Buffer**: keeps last 50 widgets so reconnecting browsers replay them.

## Development

```bash
pnpm build     # bundle to dist/
pnpm typecheck # type-only check
```
