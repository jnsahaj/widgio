---
name: widgio
description: Render animated SVG/HTML widgets inline in a browser companion. Use when a visual would help the user — diagrams, flows, mockups, charts, comparison cards, mini interactive demos. The user runs `widgio open` to see them. Trigger on phrases like "show me", "diagram", "visualize", "draw", "chart", or proactively when a visual genuinely clarifies an explanation.
---

# widgio — visual widgets for terminal agents

widgio renders SVG and HTML widgets in a browser tab. The agent calls a CLI;
the widgets stream into a browser companion at `http://127.0.0.1:4242`.

## Before first use — make sure widgio is installed

Run this as your first widgio shell command in any new session:

```bash
command -v widgio || npm install -g widgio
```

That's a no-op if `widgio` is already on `$PATH`, and a one-time global
install otherwise (~3 seconds). The widgio skill can't install the binary
for the user, so this check belongs in your flow.

**If the install fails** (permission denied, registry unreachable, etc.):
tell the user, suggest `sudo npm install -g widgio` *only if it's a
permissions error*, and stop. Don't retry blindly. If the user prefers a
different package manager, they can run `pnpm add -g widgio`,
`yarn global add widgio`, or `bun add -g widgio` — but you don't need to
guess; npm is always available with Node.

After the binary is in place, the rest of this skill applies.

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

## One widget per response — but it can cover multiple concepts

**Render at most one widget per response.** widgio's UI shows one widget
per sidebar entry; rendering 3 widgets to explain one topic fragments the
narrative across 3 entries and breaks the chat-UI mental model of "one
image per message".

That doesn't mean one *concept*. A single widget can absolutely walk
through multiple concepts — pipeline, mechanism, sampling — *as long as
each concept is a visually distinct, clearly bounded section.* The
failure isn't covering multiple things; it's covering them without
structure (concepts melted into each other, arrows crossing between
sections, rainbow colors that encode nothing — see the failure-modes
section in `widgio read-me --module diagram`).

**Three patterns for a multi-concept widget**, pick whichever fits:

1. **Stacked sections (SVG)** — concepts laid out top-to-bottom, each in
   its own framed region with a section title. A hairline rule between
   sections gives the eye a place to rest. Numbered captions ((1), (2),
   (3)) make the order explicit.
2. **Interactive tabs / stepper (HTML)** — each concept is a panel, the
   user clicks to advance. Best for sequential narratives ("step 1 →
   step 2 → ..."). Use `widgio show --mode html` and embed buttons that
   show/hide panels via JS. See the `interactive` design module.
3. **Sub-framed SVG (multi-panel)** — one SVG, each concept inside its
   own bordered region like panels of a comic. Useful when concepts
   relate spatially (before/after, input/output).

**Whichever pattern you use, the rules from `--module diagram` still
apply** — same-tier siblings share one color, arrows stop at section
boundaries, subtitles only when they add info, no curve drawn across a
label.

**Promise only what you deliver.** If your text references a section in
the widget, make sure that section is actually there.

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

Each `widgio chunk` call appends one or more **complete top-level elements**. The chunk's content is what just got drawn; the chunk's `--label` is *forward-looking* — it describes what you're working on **next**, after sending this chunk. The widget UI displays the label as a live caption so the user sees what's happening behind the scenes while they look at the chunk that just landed.

**Phrase labels in present-continuous form** ("drawing actor nodes", "wiring up the edges", "highlighting the focal node"). Don't restate what's *in* this chunk — that's already on screen. Describe what's coming.

For the **last chunk** before `widgio end`, omit `--label` (or pass `--label "finishing up"`). The caption clears on `end` regardless.

```bash
# chunk 1 contains the skeleton; the label says what comes next
widgio chunk --label "drawing actor nodes" <<'EOF'
<g id="bg">
  <rect x="0" y="0" width="680" height="320" fill="var(--surface)" />
  <line x1="170" y1="40" x2="170" y2="280" stroke="var(--border)" />
  <line x1="510" y1="40" x2="510" y2="280" stroke="var(--border)" />
</g>
EOF

# chunk 2 contains the actors; label says what's next (edges)
widgio chunk --label "wiring up request edges" <<'EOF'
<g id="actors">
  <text x="85" y="30" text-anchor="middle" fill="var(--text)" font-size="13">User</text>
  <text x="340" y="30" text-anchor="middle" fill="var(--text)" font-size="13">App</text>
  <text x="595" y="30" text-anchor="middle" fill="var(--text)" font-size="13">Auth Server</text>
</g>
EOF

# chunk 3 is the last — no label, or a closing one
widgio chunk <<'EOF'
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
