---
name: widgio
description: Render animated SVG/HTML widgets inline in a browser companion. Use when a visual would help the user — diagrams, flows, mockups, charts, comparison cards, mini interactive demos. The user runs `widgio open` to see them. Trigger on phrases like "show me", "diagram", "visualize", "draw", "chart", or proactively when a visual genuinely clarifies an explanation.
---

# widgio — visual widgets for terminal agents

widgio renders SVG and HTML widgets in a browser tab. The agent calls a CLI;
the widgets stream into a browser companion at `http://127.0.0.1:4242`.

## When to use

Use widgio when a visual would clarify an explanation:

- Architecture / system diagrams
- Flow charts (state machines, request flows)
- UI mockups for design discussions
- Charts and dashboards
- Comparison cards
- Small interactive demos (calculators, toggles)

**Don't** use widgio when:

- The user asked for a file on disk — write the file directly.
- A simple text answer suffices.
- The agent already has a domain-specific MCP tool (Figma, Excalidraw, etc.).

## Two render modes

widgio supports two delivery patterns:

1. **One-shot** (`widgio show`) — the entire widget is sent in one CLI call. Simple, fast, good for small widgets and HTML with `<script>` tags.
2. **Streaming** (`widgio start` → `chunk` → `end`) — the widget is built up in **semantic chunks** that animate in one after another. Feels like the diagram is being constructed live. Use this for non-trivial diagrams.

**Prefer streaming for diagrams.** The build-up effect is what makes widgio feel alive.

---

## Streaming workflow (preferred for diagrams)

A streaming widget is built in 3–8 chunks. Each chunk is a **complete, self-contained semantic unit** — not arbitrary character ranges.

### Step 1 — start the build

```bash
widgio start --id oauth_flow --title oauth_flow --mode svg \
            --viewBox "0 0 680 320" \
            --loading "drawing oauth flow"
```

Flags:

- `--id` (required) — short identifier; used to address subsequent chunks. Use the same string as `--title` for simple cases.
- `--title` (required) — header label shown to the user.
- `--mode svg|html` (required) — `svg` for diagrams, `html` for interactive UI.
- `--viewBox "x y w h"` — SVG viewBox; defaults to `0 0 680 400`.
- `--root '<attrs>'` — escape hatch for full root attributes (overrides `--viewBox`).
- `--loading <msg>` (repeatable) — progress messages cycled before the first chunk. Per-chunk labels (next step) take over once chunks start arriving.

### Step 2 — emit semantic chunks, one per logical group

Each `widgio chunk` call appends one or more **complete top-level elements** with a `--label` describing what's being added. The label appears under the title as the chunk lands.

```bash
widgio chunk --label "skeleton + columns" <<'EOF'
<g id="bg">
  <rect x="0" y="0" width="680" height="320" fill="var(--surface)" />
  <line x1="170" y1="40" x2="170" y2="280" stroke="var(--border)" />
  <line x1="510" y1="40" x2="510" y2="280" stroke="var(--border)" />
</g>
EOF

widgio chunk --label "actor labels" <<'EOF'
<g id="actors">
  <text x="85" y="30" text-anchor="middle" fill="var(--text)" font-size="13">User</text>
  <text x="340" y="30" text-anchor="middle" fill="var(--text)" font-size="13">App</text>
  <text x="595" y="30" text-anchor="middle" fill="var(--text)" font-size="13">Auth Server</text>
</g>
EOF

widgio chunk --label "request edges" <<'EOF'
<g id="edges">
  <path d="M 85 60 L 340 60" stroke="var(--accent)" stroke-width="1.5" fill="none" marker-end="url(#arrow)" />
  <text x="212" y="55" text-anchor="middle" fill="var(--text-muted)" font-size="11">click "log in"</text>
</g>
EOF
```

### Step 3 — seal the build

```bash
widgio end
```

`--id` defaults to the most recent `widgio start`, so for a single in-flight widget you can omit it on `chunk` and `end`.

---

## What makes a "semantic chunk"

Each chunk should be one **complete, named, mentally-cohesive piece** of the widget. Not a slice of bytes — a slice of *meaning*. Good chunk boundaries align with how a person would describe the diagram to a colleague.

Good chunk progression for a system diagram:

1. **Skeleton** — background, panels, swimlanes, axes
2. **Nodes** — boxes/circles with labels
3. **Connections** — arrows, edges, lines between nodes
4. **Annotations** — captions, callouts, numbered steps
5. **Highlights** — accent colors, focus rings, current-state markers

Good chunk progression for a chart:

1. **Frame** — axes, gridlines, labels
2. **Data series 1** — first line/bars
3. **Data series 2** — second line/bars
4. **Legend + annotations** — key, max/min markers

Good chunk progression for an interactive HTML widget (mode=html):

1. **Layout shell** — outer container, sections, headings
2. **Static content** — copy, labels, placeholders
3. **Interactive controls** — inputs, buttons (final chunk; can include `<script>`)

### Rules

- **Each chunk is a complete top-level element or sibling group.** Never split across an opening/closing tag boundary.
  - ✅ `<g id="nodes">…</g>` then `<g id="edges">…</g>`
  - ❌ `<rect x="0" y="0"` then ` width="100" height="50" />`
- **3–8 chunks per widget.** Fewer = less drama. More = tool-call overhead dominates and the model is more likely to lose the thread.
- **Each `--label` is short and human.** "drawing nodes", not "chunk 2".
- **First chunk often establishes shared structure** — `<defs>` for SVG markers/gradients, swimlane backgrounds, etc. — so later chunks can reference them.
- **HTML mode**: chunks land inside a `<div id="root">`. `<script>` only runs in the **final chunk** (or via `widgio show` one-shot if you have multiple scripts).
- **SVG mode**: each chunk's elements are auto-wrapped with a `widgio-chunk` class that fades them in. Don't add your own enter animations — they'll double up. CSS animations *inside* chunks (e.g. `<animateTransform>` on a path) work fine.

---

## One-shot fallback (`widgio show`)

For small widgets, simple HTML, or anything with `<script>` (Chart.js, mermaid, interactive controls), send everything at once:

```bash
widgio show --title hello --loading "rendering" <<'EOF'
<svg width="100%" viewBox="0 0 680 120" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Hello widget</title>
  <desc>Placeholder.</desc>
  <text class="th" x="340" y="60" text-anchor="middle" dominant-baseline="central">Hello</text>
</svg>
EOF
```

Flags: `--title`, `--loading` (repeatable), `--mode auto|svg|html`, `--open`.

**Use one-shot for anything with `<script>`.** Chunked streaming injects via `innerHTML` which doesn't execute scripts — interactive widgets, Chart.js, mermaid, sliders all need `widgio show`.

---

## Read the design system first

Before generating widget code, load the relevant module:

```bash
widgio read-me --module diagram        # SVG flowcharts, structural, illustrative
widgio read-me --module mockup         # HTML cards, comparisons, data records
widgio read-me --module interactive    # HTML steppers, ERDs, embedded charts
widgio read-me --module chart          # Chart.js charts and dashboards
widgio read-me --module art            # SVG illustration / generative
widgio read-me --module diagram --module chart   # multiple at once
```

`core` (universal rules + design tokens + 9-ramp color palette + sendPrompt) is **automatically prepended** to every `read-me` call. You don't need to request it explicitly.

The output includes: canvas dimensions, color ramps with hex stops, typography rules, pre-built SVG classes (`t`/`ts`/`th`/`box`/`node`/`arr`/`leader`/`c-{ramp}`), CSS variables for HTML widgets (`--color-text-primary`, `--color-background-primary`, etc.), boilerplate, layout rules, animation guidance, and concrete examples. Read it, then generate code that follows the conventions.

## Other commands

```bash
widgio open      # open the browser feed (auto-spawns server if needed)
widgio status    # show daemon pid, port, url
widgio stop      # kill the daemon
```

## Workflow for the agent

1. Decide a visual would help.
2. **Pick the module** that fits: `diagram` / `mockup` / `interactive` / `chart` / `art`.
3. `widgio read-me --module <module>` to load the design rules. (`core` auto-prepends.)
4. Decide: **streaming** (diagrams, mockups, art) or **one-shot** (anything with `<script>` — interactive, charts, mermaid).
5. For streaming: plan 3–8 semantic chunks. `widgio start …`, then `widgio chunk --label "…"` per chunk, then `widgio end`.
6. For one-shot: `widgio show --title … <<EOF … EOF`.
7. On the **first** widget in a session, mention the URL (`http://127.0.0.1:4242`) so the user knows where to look. Optionally pass `--open` on `start` or `show`.
8. Briefly tell the user what was rendered. Don't put prose inside the widget itself — explanatory text belongs in your response.

## Heredoc pattern

The CLI reads chunk content from stdin. Always use a quoted heredoc to disable shell expansion:

```bash
widgio chunk --label "…" <<'EOF'
<g>…</g>
EOF
```

Quoted `'EOF'` matters — without quotes, `$variable` and backticks in your SVG/HTML would expand.

## Tips

- Keep total widget size under ~50KB across all chunks.
- Use CSS variables (`var(--text)`, `var(--border)`, `var(--accent)`) so widgets adapt to dark mode.
- Prefer SVG streaming for diagrams; SVG renders progressively and looks alive.
- The browser tab persists across agent sessions — daemon idle-shuts after 30 min of inactivity.
- The first widget in a session triggers a server auto-spawn (~500ms). Subsequent calls are instant.
