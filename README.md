# widgio

Stream animated SVG / HTML widgets from terminal coding agents to a live browser companion.

Works with **Claude Code**, **Codex**, and any agent that can run shell commands.

---

**What you get**

- Diagrams, mockups, comparison cards, and interactive demos rendered next to your conversation
- Smooth "drawing in" animations as each chunk arrives
- Streaming support — render incrementally as the agent writes

---

## Install

```bash
npx skills add jnsahaj/widgio -g
```

This drops the skill into your agent's skills directory. The CLI self-bootstraps on first use — no separate step needed.

To pre-install the binary:

```bash
npm i -g widgio
```

---

## Commands

```bash
widgio open                        # open the companion tab
widgio show --title "My widget" <svg>…</svg>   # one-shot render
widgio start --id foo --title "Title" --mode svg --viewBox "0 0 680 320"
widgio chunk --label "part"        # stream a chunk
widgio end                         # finish stream
widgio read-me --module diagram    # design system reference
widgio status                      # daemon status
widgio stop                        # kill the daemon
widgio --version
```

---

## Update

```bash
npm i -g widgio          # update CLI
widgio stop              # restart daemon
npx skills add jnsahaj/widgio -g   # update skill
```

---

MIT — [LICENSE](./LICENSE)
