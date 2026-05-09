# widgio — core design system

These rules apply to ALL widgets. Always read this alongside the module-specific guide (`diagram`, `mockup`, `interactive`, `chart`, `art`).

## Modules

Call `widgio read-me` again with `--module <name>` to load detailed guidance:

- `diagram` — SVG flowcharts, structural diagrams, illustrative diagrams
- `mockup` — UI cards, comparison grids, data records
- `interactive` — interactive explainers with controls
- `chart` — Chart.js charts, dashboards
- `art` — illustration and generative art

Pick the closest fit. The module includes all relevant design guidance.

## Two render modes

widgio supports two delivery patterns:

1. **One-shot** (`widgio show`) — entire widget sent in one CLI call. Use for: small SVG, HTML with `<script>` tags, anything trivial.
2. **Streaming** (`widgio start` → `chunk` × N → `end`) — widget built up in **3–8 semantic chunks** that animate in one after another. Use for: any non-trivial diagram, dashboards, multi-section mockups.

**Prefer streaming for diagrams.** The build-up effect — skeleton → nodes → connections → labels — is what makes widgio feel alive. See SKILL.md for protocol details. Each chunk should be a complete, named, mentally-cohesive piece (not a slice of bytes — a slice of *meaning*).

## Philosophy

- **Compact.** Show the essential inline. Explain the rest in your response text.
- **Flat, but defined.** No gradients (one exception in illustrative diagrams), no drop shadows, no blur, no glow, no neon. Solid flat fills, visible 1px borders. Lines should be *seen*, not *suggested* — hairline strokes look like a rendering bug at this surface contrast.
- **Text goes in your response, visuals go in the widget.** All explanatory paragraphs, intros, and summaries live in your normal response text **outside** the widget. The widget output should contain ONLY the visual element. Never put descriptive prose, section headings, or wall-of-text inside the SVG/HTML.

## Complexity budget — hard limits

- **Box subtitles:** ≤5 words. Detail goes in click-through (`sendPrompt`) or the prose below — not the box.
- **Colors:** ≤2 ramps per diagram. If colors encode meaning (states, tiers), add a 1-line legend. Otherwise use one neutral ramp.
- **Horizontal tier:** ≤4 boxes at full width (~140px each). 5+ boxes → shrink to ≤110px OR wrap to 2 rows OR split into overview + detail diagrams.

If you catch yourself writing "click to learn more" in prose, the widget itself must ACTUALLY be sparse. Don't promise brevity then front-load everything.

## Rules

- No `<!-- comments -->` or `/* comments */` in the widget code (waste tokens, no value).
- No font-size below 11px.
- No emoji in widget content. Use Tabler icons (`<i class="ti ti-NAME"></i>` — outline only, e.g. `ti-home`, `ti-arrow-right`, `ti-check`, `ti-x`, `ti-chart-bar`, `ti-bell`, `ti-mail`, `ti-search`, `ti-settings`, `ti-user`). Inherits color and font-size from parent. Decorative icons get `aria-hidden="true"`. Never invent `-filled` variants — they aren't loaded.
- No gradients, drop shadows, blur, glow, or neon effects. (Illustrative diagrams may use ONE `<linearGradient>` to show a continuous physical property — see `diagram` module.)
- No dark/colored backgrounds on outer containers — widgio's surface already provides them. The widget content should be transparent.
- **Headings:** h1 = 22px, h2 = 18px, h3 = 16px — all `font-weight: 500` with negative letter-spacing (already wired into the runtime, don't override). Body text = 13px, weight 400, `line-height: 1.7`. **Two weights only: 400 regular, 500 medium.** Never 600/700.
- **Sentence case** always. Never Title Case, never ALL CAPS. Applies to SVG text labels and HTML headings.
- **No mid-sentence bolding.** Function names and code identifiers go in `<code>` not `<strong>`. Bold is for headings and labels only.
- **Mono for technical labels.** Use `var(--font-mono)` (or the SVG `tm` class) for token IDs, hashes, counts, file paths, code identifiers, status counters. Use sans for everything else. Mixing the two — sans for prose labels, mono for the value — is the system's signature.
- **Corners:** use `var(--border-radius-md)` (6px) or `-lg` (10px) for cards in HTML. In SVG, `rx="6"` is default; `rx="10"` for emphasized rounding; `rx="999"` for full pills.
- **No rounded corners on single-sided borders.** If using `border-left` or `border-top` accents, set `border-radius: 0`.
- **No titles or prose inside the widget output.** See Philosophy above.
- **Icon sizing:** Tabler `<i>` sizes via `font-size` — 16–20px inline, 24px max decorative.
- No `display: none` sections during chunked streaming — hidden content streams invisibly. Show all content stacked vertically. (Post-streaming JS-driven steppers are fine — see `interactive` module.)
- No nested scrolling — auto-fit height.
- Scripts execute after the iframe finishes loading. Load libraries via `<script src="https://cdnjs.cloudflare.com/ajax/libs/...">` (UMD globals), then use the global in a plain `<script>` that follows.
- **CDN allowlist (recommended)**: prefer `cdnjs.cloudflare.com`, `esm.sh`, `cdn.jsdelivr.net`, `unpkg.com`. Other origins may work in widgio's iframe (no strict CSP) but are less reliable.

## CSS variables (use these, don't hardcode colors)

**Backgrounds:** `--color-background-primary` (#000 — page base), `-secondary` (#0a0a0a — raised surface, default for cards), `-tertiary` (#111 — hover lift), `-info`, `-danger`, `-success`, `-warning`

**Text:** `--color-text-primary` (#fafafa), `-secondary` (#a1a1a1, muted), `-tertiary` (#666, hints), `-info`, `-danger`, `-success`, `-warning`

**Borders:** `--color-border-tertiary` (#1f1f1f — quietest), `-secondary` (#2a2a2a — default), `-primary` (#444 — emphasis/hover), semantic `-info` (#0070f3) `-danger` `-success` `-warning`. **All borders are solid 1px** — no rgba hairlines.

**Typography:** `--font-sans` (Geist), `--font-serif`, `--font-mono` (Geist Mono). Both webfonts ship with the iframe. The SVG `t/ts/th` classes already use sans; the `tm` class uses mono.

**Layout:** `--border-radius-sm` (4px — pills, small chips), `--border-radius-md` (6px — default, inputs/buttons/most cards), `--border-radius-lg` (10px — emphasized cards), `--border-radius-xl` (14px — outer containers in structural diagrams).

widgio renders in **forced dark mode** (true black base, near-black surfaces, off-white text). All variables are pre-resolved for that. **Never hardcode `color: #333` or `background: white`** — they'll be invisible. Use the variables.

## Color philosophy — neutrals first

The default for any diagram is **monochrome**: `c-gray` (or unstyled `box`) for every node, with neutral connectors. Reach for color only when it encodes something specific. A confidently grayscale diagram with one accent reads more refined than a six-color one — the eye sees structure, not decoration.

**The accent is `c-blue`.** It's the system's voice color — use it for the focal node, the highlighted path, the "this one" in a comparison. Most diagrams should have at most one `c-blue` element.

Categorical color is the exception, not the default. Use it when:

- A diagram genuinely has multiple distinct categories that the user needs to track across the figure (immune cells vs pathogens vs outcomes; producer vs consumer vs broker).
- Color encodes a physical property in an illustrative diagram (warm = heat, cool = calm, green = organic).

Otherwise, stay grayscale + accent.

## Color palette — 9 ramps (when categorical color is warranted)

For when you've decided categorical color is earning its keep. CSS classes are pre-loaded for SVG (`c-blue`, `c-teal`, etc.) — they auto-set fill, stroke, and child text color for the dark surface.

The runtime tunes each ramp into three values: a deep fill, a mid stroke, and a bright label color. Reference values for hand-picked use (badges, charts, illustrative diagrams):

| Class      | Ramp   | Fill    | Stroke  | Label   |
|------------|--------|---------|---------|---------|
| `c-blue`   | Blue   | #002F66 | #3291FF | #BCDDFF |
| `c-purple` | Purple | #2A2566 | #8C84D9 | #D8D4F8 |
| `c-teal`   | Teal   | #003D33 | #4DBE9B | #B2EAD6 |
| `c-coral`  | Coral  | #5A1F0E | #E88563 | #F5C9B8 |
| `c-pink`   | Pink   | #5A1A30 | #E47AA0 | #F5C5D7 |
| `c-green`  | Green  | #0F3D08 | #87C84B | #C8E5A2 |
| `c-amber`  | Amber  | #4A2A04 | #F5A623 | #FBD89A |
| `c-red`    | Red    | #5A0F0F | #FF6B6B | #FCC8C8 |
| `c-gray`   | Gray   | #161616 | #444444 | #d4d4d4 |

**How to assign colors:**

- **Default to `c-gray`.** Same-tier siblings get the *same* color (almost always gray).
- **Reserve `c-blue` for the accent** — the focal node, the recommended option, the active stage in a flow. One per diagram is the target.
- **Group by category** when category is real — all nodes of the same type share one color. Pick from the categorical ramps (`c-purple`, `c-teal`, `c-coral`, `c-pink`).
- **For illustrative diagrams**, map colors to **physical properties** — warm ramps for heat/energy, cool for cold/calm, green for organic, gray for structural/inert.
- **2–3 colors per diagram, never 6+.** Gray + blue + one categorical accent is enough.
- **Reserve `c-green/-amber/-red` for semantic meaning** — success, warning, error. Don't use them as decorative categories or you confuse the reader.

**Text on colored backgrounds:** the `c-*` SVG classes auto-handle this. For HTML badges, use the Label color on top of the Fill color from the same ramp via inline style — never `color: black` or `color: white`.

**Apply `c-{ramp}`** to a `<g>` wrapping shape+text, or directly to a `<rect>`/`<circle>`/`<ellipse>`. Never to `<path>` — paths don't get ramp fill. For colored connector strokes, use inline `stroke="#..."` with the Stroke value from the table above.

## sendPrompt(text)

A global function that sends a message back to the chat as if the user typed it. **Note:** in widgio v1 this posts to the daemon but no agent-side blocker exists yet — clicks register but won't round-trip into the conversation automatically. Still safe to wire up `onclick="sendPrompt('…')"` — it's a no-op if not handled, and forward-compatible.

Use it where the user's next step benefits from the agent thinking (drill-downs, comparisons, "tell me more about X"). For filtering, sorting, toggling, calculations — handle in JS, not sendPrompt.

## Links

`<a href="https://...">` works. Or call `openLink(url)` directly.

## Streaming structure (chunk authoring)

widgio renders chunk-by-chunk with a fade-in animation. To make the build-up read well:

- **Each chunk is a complete top-level element or sibling group.** Never split across an opening/closing tag boundary.
  - ✅ `<g id="nodes">…</g>` then `<g id="edges">…</g>`
  - ❌ `<rect x="0" y="0"` then ` width="100" height="50" />`
- **First chunk often establishes shared structure** — `<defs>` for SVG markers, swimlane backgrounds, axes — so later chunks can reference them.
- **HTML mode:** chunks land inside `<div id="root">`. `<script>` tags inside chunks **won't execute** — use `widgio show` one-shot for interactive HTML, or put scripts in a final chunk only as inert text and accept they won't run.
- **SVG mode:** each chunk's elements are auto-wrapped with a `widgio-chunk` class that fades them in. Don't add your own enter animations on the same elements — they'll double up. CSS animations *inside* chunks (e.g. `<animateTransform>` on a path) work fine.

## SVG widget setup

```svg
<svg width="100%" viewBox="0 0 680 H" role="img">
  <title>One-sentence summary for screen readers</title>
  <desc>Longer description of the diagram</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>
  <!-- content -->
</svg>
```

- **viewBox width is always 680** — load-bearing. It matches the widget container so 1 SVG unit = 1 CSS pixel. Don't change it. If your content is naturally narrow, keep `viewBox="0 0 680 H"` and center the content (e.g. spans x=240..440); don't shrink the viewBox.
- **viewBox height H** = bottom-most point of any shape (including text baselines + 4px descent) + 20–40px padding. Don't guess. Don't leave excess empty space below content.
- **Safe area:** x=40 to x=640, y=40 to y=(H-40).
- **Background transparent.** widgio provides the surface — the widget itself is bare.
- **Arrow marker:** include the `<defs>` block above on every diagram. Use `marker-end="url(#arrow)"` on lines. The head uses `context-stroke`, so it inherits the line color automatically.
- **`role="img"`** with `<title>` and `<desc>` as the first children for screen readers.

When streaming an SVG with `widgio start --mode svg --viewBox "0 0 680 H"`, widgio creates the `<svg>` root for you with the runtime CSS injected — your chunks are SVG fragments that go inside it. (Include the `<defs>` arrow marker as your first chunk.)

## SVG style rules

- Every `<text>` element must carry `t`, `ts`, or `th` class. An unclassed `<text>` inherits the default sans font but no fill — it'll render invisible against the dark surface.
- Two font sizes only: 14px for node/region labels (`t` or `th`), 12px for subtitles and arrow labels (`ts`).
- No decorative step numbers, oversized headings outside boxes.
- No icons or illustrations inside boxes — text only. (Exception: illustrative diagrams may use simple shape-based indicators inside drawn objects.)
- Sentence case on all labels.
- **Stroke width:** 1px for node borders, 1px for connector arrows. The runtime classes are already set to 1px — don't override. Thicker than 1px is reserved for highlight rings (1.5px max) and illustrative-diagram emphasis lines.
- **Connector paths need `fill="none"`.** SVG defaults to `fill: black` — a curved connector without `fill="none"` renders as a huge black shape. Every `<path>` or `<polyline>` used as a connector/arrow MUST have `fill="none"`.
- **Rect rounding:** `rx="6"` is the default. `rx="10"` for emphasized cards. `rx ≥ height/2` = pill — deliberate only.
- **No rotated text.** `<defs>` may contain the arrow marker, an optional `<clipPath>`, subtle `<pattern>` fills used as a secondary cue alongside color, and — in illustrative diagrams only — a single `<linearGradient>`. Nothing else.

## Pre-built SVG classes (already loaded by widgio)

- `class="t"` = sans 14px primary
- `class="ts"` = sans 12px secondary
- `class="th"` = sans 14px medium (500), with negative letter-spacing — use for node titles
- `class="tm"` = mono 12px secondary — use for token IDs, hashes, counts, file paths, code identifiers, anything technical
- `class="box"` = neutral rect (secondary fill, secondary 1px border)
- `class="node"` = clickable group with hover effect
- `class="arr"` = arrow line (1px, rounded cap, secondary stroke)
- `class="leader"` = dashed leader line (0.75px, tertiary stroke)
- `class="c-{ramp}"` = colored node (`c-blue`, `c-teal`, `c-amber`, `c-green`, `c-red`, `c-purple`, `c-coral`, `c-pink`, `c-gray`). Apply to `<g>` or shape (rect/circle/ellipse) — NOT to paths. Sets fill+stroke (1px) and auto-adjusts child `t`/`ts`/`th` text color.

**`c-{ramp}` nesting rule:** these classes use direct-child selectors. Nest a `<g>` inside `<g class="c-blue">` and the inner shapes become grandchildren — they lose the fill. Put `c-*` on the innermost group holding the shapes, or on the shapes directly. If you need click handlers, put `onclick` on the `c-*` group itself.

## Font size calibration

The runtime ships Geist Sans and Geist Mono via webfont. Char widths approximate (Geist 14px medium):

```
text                                      chars  weight  size  width
"Authentication Service"                    22    500    14px  ~155px
"Background Job Processor"                  24    500    14px  ~185px
"Detects and validates incoming tokens"     37    400    14px  ~255px
"forwards request to"                       19    400    12px  ~115px
```

Before placing text in a box, check: does `(text width + 2 × padding)` fit the container?

**SVG `<text>` never auto-wraps.** Every line break needs an explicit `<tspan x="..." dy="1.2em">`. If your subtitle is long enough to need wrapping, it's too long — shorten it.

**Special characters are wider:** chemical formulas (C₆H₁₂O₆), math notation, subscripts via `<tspan>`, and Unicode all render wider than plain Latin. Add 30–50% extra width for labels with formulas.

## Accessibility

- For HTML widgets, begin with a visually-hidden `<h2 class="sr-only">` containing a one-sentence summary of the widget for screen-reader users.
- For SVG widgets, use `role="img"` with `<title>` and `<desc>` as the first children.
- Never rely on color alone to distinguish categories — pair color with shape, dash pattern, or hatching.
- Decorative icons: `aria-hidden="true"`. Functional icon-only buttons: `aria-label="..."`.

## Numbers

**Round every displayed number.** JS float math leaks artifacts (`0.1 + 0.2` → `0.30000000000000004`, `7 * 1.1` → `7.700000000000001`). Any number reaching the screen — slider readouts, stat cards, axis labels, tooltips, totals — goes through `Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`. Pick precision per context: integers for counts, 1–2 decimals for percentages, `toLocaleString()` for currency. For range sliders, also set `step="1"` (or `0.1` etc.) so the input itself emits round values.
