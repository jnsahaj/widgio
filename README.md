# widgio

Stream animated **SVG / HTML widgets** from terminal coding agents to a browser
companion. Diagrams, mockups, comparison cards, mini interactive demos —
rendered live next to your conversation.

Works with **Claude Code** and **Codex**.

```text
agent --[shell]--> widgio CLI --[http]--> daemon --[sse]--> browser
                                              ^
                                              └─ http://127.0.0.1:4242
```

The agent decides when a visual would clarify its answer, calls
`widgio show …` (or streams chunks via `widgio start / chunk / end`), and the
companion tab renders it with a soft "drawing in" animation.

---

## Install

One command, any agent ([Claude Code](https://claude.com/claude-code),
[Codex](https://github.com/openai/codex), Cursor, OpenCode, …) — via
[skills.sh](https://skills.sh):

```bash
npx skills add jnsahaj/widgio -g
```

That drops the skill into your agent's skills directory
(`~/.claude/skills/widgio/`, `~/.codex/skills/widgio/`, etc.). Add `-a
claude-code` (or `-a codex`) to scope to a single agent if you have more
than one installed.

The skill ships an auto-bootstrap line — the first time the agent runs a
widgio command, it'll `npm install -g widgio` itself if the binary isn't on
`$PATH`. So `npx skills add` is all you need; the CLI takes care of itself.

If you'd rather pre-install the binary:

```bash
npm i -g widgio          # or: pnpm add -g widgio / yarn global add widgio / bun add -g widgio
```

Restart your agent after install — the skill loads on next session.

### Manual install (no `npx`)

Drop [`skills/widgio/SKILL.md`](skills/widgio/SKILL.md) (plain markdown, no
agent-specific syntax) into wherever your agent reads skills:

```bash
# Claude Code
git clone https://github.com/jnsahaj/widgio /tmp/widgio \
  && rm -rf ~/.claude/skills/widgio \
  && mv /tmp/widgio/skills/widgio ~/.claude/skills/widgio \
  && rm -rf /tmp/widgio

# Codex — same command, swap ~/.claude for ~/.codex
```

Make sure `widgio` is on `$PATH` (or let the skill self-bootstrap).

---

## Updating

Three things move independently: the **CLI**, the **skill**, and the
**daemon** (which is just a process the CLI auto-spawns — restart it after
a CLI update with `widgio stop`).

### Update the CLI

```bash
npm i -g widgio                  # or: pnpm add -g widgio / yarn global add widgio / bun add -g widgio
widgio --version                 # confirm the new version
widgio stop                      # so the next call spawns a fresh daemon
```

### Update the skill

Re-run the install — `npx skills add` is idempotent and pulls the latest:

```bash
npx skills add jnsahaj/widgio -g
```

Restart your agent (or open a new session) afterwards.

---

## Use it

Once a widget arrives, open the companion tab:

```bash
widgio open
```

Render a one-shot widget:

```bash
widgio show --title hello --loading "rendering" <<'EOF'
<svg viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg">
  <text x="340" y="100" text-anchor="middle" font-size="24">Hello widgio</text>
</svg>
EOF
```

Or stream a diagram in semantic chunks (preferred for non-trivial diagrams —
each chunk fades in):

```bash
widgio start --id oauth --title "OAuth flow" --mode svg \
            --viewBox "0 0 680 320"

widgio chunk --label "actors" <<'EOF'
<g>...</g>
EOF

widgio chunk --label "edges" <<'EOF'
<g>...</g>
EOF

widgio end
```

Other commands:

```bash
widgio read-me --module diagram   # design system reference for the agent
widgio status                     # daemon status
widgio stop                       # kill the daemon
widgio --version                  # print version (also: -v)
```

---

## License

MIT — see [LICENSE](./LICENSE).
