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

- [Claude Code](#install-for-claude-code)
- [Codex](#install-for-codex)
- [Other agents](#other-agents)

The widgio skill ships an auto-bootstrap line — the first time the agent
runs a widgio command, it'll `npm install -g widgio` itself if the binary
isn't on `$PATH`. So you only need to install the **skill** below; the CLI
takes care of itself.

If you'd rather pre-install the binary:

```bash
npm i -g widgio          # or: pnpm add -g widgio / yarn global add widgio / bun add -g widgio
```

### Install for Claude Code

Inside Claude Code, run these as **two separate commands** — paste the
first, hit return, wait for it to finish, then paste the second. (If you
paste both at once, Claude Code reads the second line as part of the
marketplace name and the clone fails.)

**Step 1** — register the marketplace:

```text
/plugin marketplace add jnsahaj/widgio
```

**Step 2** — install the plugin:

```text
/plugin install widgio@widgio
```

Restart Claude Code after install. The skill is loaded automatically the
next time the agent decides a visual would help.

To install from a local checkout instead:

```text
/plugin install /absolute/path/to/widgio/plugin
```

### Install for Codex

Drop the skill into Codex's skills directory:

```bash
curl -fsSL https://codeload.github.com/jnsahaj/widgio/tar.gz/main | tar xz -C /tmp \
  && mkdir -p ~/.codex/skills \
  && rm -rf ~/.codex/skills/widgio \
  && mv /tmp/widgio-main/plugin/skills/widgio ~/.codex/skills/widgio \
  && rm -rf /tmp/widgio-main
```

The command is **idempotent** — re-run it any time to update to the latest
skill. Restart Codex (or open a new session) to pick up changes. Verify:

```bash
ls ~/.codex/skills/widgio/SKILL.md
```

Or, if you prefer Codex's built-in `skill-installer`, ask Codex from inside
the TUI:

```text
install the widgio skill from github.com/jnsahaj/widgio (path plugin/skills/widgio)
```

For a per-repo install (skill scoped to current project only), replace
`~/.codex/skills` with `./.codex/skills` in the curl command above.

### Other agents

The CLI is the universal interface — any agent that can run shell commands
can use widgio. Drop `plugin/skills/widgio/SKILL.md` (plain markdown, no
Claude- or OpenAI-specific syntax) wherever your agent reads skills, and
make sure `widgio` is on `$PATH` (or let the skill self-bootstrap).

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

### Update the skill (Claude Code)

Inside Claude Code, three commands — run each separately, one paste at a
time:

```text
/plugin marketplace update widgio
```

```text
/plugin uninstall widgio@widgio
```

```text
/plugin install widgio@widgio
```

Claude Code doesn't currently document a single `/plugin update` command,
so uninstall + reinstall after refreshing the marketplace cache is the
canonical path.

### Update the skill (Codex)

Re-run the install one-liner — it's idempotent:

```bash
curl -fsSL https://codeload.github.com/jnsahaj/widgio/tar.gz/main | tar xz -C /tmp \
  && mkdir -p ~/.codex/skills \
  && rm -rf ~/.codex/skills/widgio \
  && mv /tmp/widgio-main/plugin/skills/widgio ~/.codex/skills/widgio \
  && rm -rf /tmp/widgio-main
```

Restart Codex (or open a new session) afterwards.

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
