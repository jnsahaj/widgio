# widgio — diagram module

For SVG diagrams: flowcharts, structural diagrams, illustrative diagrams.
**Read `core` first.** This module assumes the universal rules from there.

## Failure modes — read these first

Three failures account for most ugly diagrams. Each individually breaks rules below; together they produce a slapdash output. Check each before drawing.

### 1. Multiple concepts melted into one diagram

The user asks *"how does X work"*, you reach for one diagram, and end up with an overview pipeline jammed against a zoomed-in mechanism — no separators, no section titles, arrows from one concept landing in the middle of another. The eye gives up.

The fault is composition, not count. A single widget *can* cover pipeline + mechanism + sampling — but each concept needs its own visually distinct, clearly bounded section. See SKILL.md → "Three patterns for a multi-concept widget" for the structural options (stacked sections, interactive stepper, sub-framed SVG).

**Fix:** if a widget covers multiple concepts, frame them. Each concept goes inside its own region with a hairline border or background tint, a short section heading at the top, and a number ((1), (2), (3)) if they're sequential. Arrows stay inside their section unless the cross-section flow IS the point. Same-tier siblings inside a section share one color.

A symptom that you've under-structured: if you can't trace each concept's boundary by following a stroke around it, the sections aren't framed enough.

### 2. Rainbow top row of unrelated colors

5 sibling boxes in a row, colored gray/teal/purple/amber/blue "to make it designful". The colors encode nothing. Reads as 5 independent things, not a sequence.

**Fix:** Same-tier siblings get the SAME color — **default to `c-gray` for all of them**. Use `c-blue` only on the focal node (the one currently being explained, or the recommended option). Reach for a second categorical ramp only when you can name what the distinction encodes (input vs output, before vs after, active vs idle, role A vs role B). If you can't name it, you don't need it. **A grayscale-plus-one-accent diagram looks more refined than a six-color one.**

### 3. Subtitle that paraphrases the title

`<rect>` with title "Tokens" and subtitle "Pieces". Or "Prompt / Text in". The subtitle is a synonym in fewer words. It adds nothing and steals visual weight from the things that matter (token IDs, weights, counts).

**Fix:** Subtitles are for NEW information — IDs, counts, types, examples. If yours just restates the title, drop it and use a single-line node. When in doubt, ship single-line.

### 4. Curve drawn across a label

Loop arrows return from end to start in linear flows; if their curve passes through the loop's label, the label looks struck through. Same for arrow labels placed on a midpoint that crosses another shape.

**Fix:** Loop labels go ABOVE the curve with ≥12px clearance, OR replace the curve with a small `↻` glyph + text in clear space. Arrow midpoint labels go in clear airspace, never overlapping a stroke.

These four account for the gap between "this looks designed" and "this looks rushed". Re-check each before `widgio end`.

**Diagrams are the hardest widget type** — they have the highest failure rate due to precise coordinate math. Common mistakes: viewBox too small (content clipped), arrows through unrelated boxes, labels sitting on arrow lines, text past viewBox edges, satellite shapes overlapping stages they feed. Double-check coordinates before finalizing.

## Pick the right type — route on the verb, not the noun

The decision is about *intent*. Ask: is the user trying to *document* this, or *understand* it?

**Reference diagrams** — the user wants a map they can point at. Precision matters more than feeling. Boxes, labels, arrows, containment. These are the diagrams in documentation.

- **Flowchart** — steps in sequence, decisions branching, data transforming. Good for: approval workflows, request lifecycles, build pipelines, "what happens when I click submit". Trigger phrases: *"walk me through the process"*, *"what are the steps"*, *"what's the flow"*.
- **Structural diagram** — things inside other things. Good for: file systems, VPC/subnet/instance, "what's inside a cell". Trigger phrases: *"what's the architecture"*, *"how is this organised"*, *"where does X live"*.

**Intuition diagrams** — the user wants to *feel* how something works. The goal isn't a correct map, it's the right mental model. These should look nothing like a flowchart. The subject doesn't need a physical form — it needs a *visual metaphor*.

- **Illustrative diagram** — draw the mechanism. Physical things get cross-sections (water heaters, engines, lungs). Abstract things get spatial metaphors: an LLM is a stack of layers with tokens lighting up as attention weights, gradient descent is a ball rolling down a loss surface, a hash table is a row of buckets with items falling into them. Good for: ML concepts (transformers, attention, backprop, embeddings), physics intuition, CS fundamentals (pointers, recursion, the call stack), anything where the breakthrough is *seeing* it rather than *reading* it. Trigger phrases: *"how does X actually work"*, *"explain X"*, *"I don't get X"*, *"give me an intuition for X"*.

| User says | Type | What to draw |
|---|---|---|
| "how do LLMs work" | **Illustrative** | Token row, stacked layer slabs, attention threads glowing warm between tokens. Go interactive if you can. |
| "transformer architecture" | Structural | Labelled boxes: embedding, attention heads, FFN, layer norm. |
| "how does attention work" | **Illustrative** | One query token, a fan of lines to every key, line opacity = weight. |
| "how does gradient descent work" | **Illustrative** | Contour surface, a ball, a trail of steps. Slider for learning rate. |
| "what are the training steps" | Flowchart | Forward → loss → backward → update. Boxes and arrows. |
| "how does TCP work" | **Illustrative** | Two endpoints, numbered packets in flight, an ACK returning. |
| "TCP handshake sequence" | Flowchart | SYN → SYN-ACK → ACK. Three boxes. |
| "explain the Krebs cycle" / "how does the event loop work" | **HTML stepper** (see `interactive`) | Click through stages. Never a ring. |
| "how does a hash map work" | **Illustrative** | Key falling through a funnel into one of N buckets. |
| "draw the database schema" / "show me the ERD" | **mermaid.js** (see `interactive`) | `erDiagram` syntax. Not SVG. |

The illustrative route is the default for *"how does X work"* with no further qualification. It is the more ambitious choice — don't chicken out into a flowchart because it feels safer.

Don't mix families in one diagram. If you need both an intuition view and a reference view, pick the one that's more load-bearing for the user's question and put the other in prose.

## One widget per response

widgio renders one widget per sidebar entry — multiple widgets for one explanation fragment the narrative across entries and clutter the UI. So: at most one widget per agent response.

That widget can cover multiple concepts. Use the structural patterns in SKILL.md → "Three patterns for a multi-concept widget" (stacked sections, interactive stepper, sub-framed SVG). What matters is that each concept inside the widget is visually framed and clearly delineated — not that there's only one concept.

**Promise only what you deliver.** If your text references a section in the widget, make sure that section is actually there.

## Two rules that cause most diagram failures

Check these before writing each arrow and each box:

1. **Arrow intersection check.** Before writing any `<line>` or `<path>`, trace its coordinates against every box you've already placed. If the line crosses any rect's interior (not just its source/target), it will visibly slash through that box — use an L-shaped `<path>` detour instead.
2. **Box width from longest label.** Before writing a `<rect>`, find its longest child text. `rect_width = max(title_chars × 8, subtitle_chars × 7) + 24`. A 100px-wide box holds at most a 10-char subtitle. If your subtitle is "Files, APIs, streams" (20 chars), the box needs 164px minimum.

## Tier packing

Compute total width BEFORE placing. Example — 4 consumer boxes:

- WRONG: x=40,160,260,360 w=160 → 40–60px overlaps (4×160=640 > 480 available)
- RIGHT: x=50,200,350,500 w=130 gap=20 → fits (4×130 + 3×20 = 580 ≤ 590 safe width)

Work bottom-up for trees: size leaf tier first, parent width ≥ sum of children.

## ViewBox safety checklist

Before finalizing any SVG, verify:

1. Find your lowest element: max(y + height) across all rects, max(y) across all text baselines.
2. Set viewBox height = that value + 20–40px buffer.
3. Find your rightmost element: max(x + width) across all rects. All content within x=0..680.
4. For text with `text-anchor="end"`, the text extends LEFT from x. If x=118 and text is 200px wide, it starts at x=−82 — outside the viewBox.
5. Never use negative x or y coordinates.
6. **No unintentional overlaps.** For every pair of elements that aren't meant to layer, check their bounding boxes do not intersect. The only allowed overlaps are deliberate: a label centered inside its own box, an arrowhead touching the box it points to, a highlight rect behind the thing it highlights.
7. Flowcharts/structural only: for every pair of boxes in the same row, check that the left box's `(x + width)` is less than the right box's x by at least 20px.

**`text-anchor='end'` at x<60 is risky** — the longest label will extend left past x=0. Use `text-anchor='start'` or check: `label_chars × 8 < anchor_x`.

**One SVG per call** — each widget contains exactly one `<svg>` element.

**Schematic containers use dashed rects with a label.** Don't draw literal shapes (organelle ovals, server tower icons) — the diagram is a schema, not an illustration. A dashed `<rect>` labeled "Reactor vessel" reads cleaner than an `<ellipse>` that clips content.

**Lines stop at component edges.** Compute stop/start coordinates from the component's position and size — never draw through and rely on a fill to hide the line.

**Minimize standalone labels.** Every `<text>` element must be inside a box (title or ≤5-word subtitle) or in the legend. Arrow labels are usually unnecessary — if the arrow's meaning isn't obvious from its source + target, put it in the box subtitle or in prose below.

## Flowchart

For sequential processes, cause-and-effect, decision trees.

**Planning.** Size boxes to fit their text generously. At 14px sans-serif, each character is ~8px wide — "Load Balancer" (13 chars) needs a rect at least 140px wide. When in doubt, make boxes wider.

**Spacing.** 60px minimum between boxes, 24px padding inside boxes, 12px between text and edges. 10px gap between arrowheads and box edges. Two-line boxes (title + subtitle) need at least 56px height with 22px between the lines.

**Vertical text placement.** Every `<text>` inside a box needs `dominant-baseline="central"`, with y set to the *centre* of the slot. For text centred in a rect at `(x, y, w, h)`: `<text x={x+w/2} y={y+h/2} text-anchor="middle" dominant-baseline="central">`. For a row inside a multi-row box, y is the centre of *that row*, not the whole box.

**Layout.** Prefer single-direction flows (all top-down or all left-right). Max 4–5 nodes per diagram.

**When the prompt is over budget:** if the user lists 6+ components ("draw me auth, products, orders, payments, gateway, queue"), don't draw all in one pass. Decompose: (1) a stripped overview with just the boxes and one main flow; (2) one diagram per interesting sub-flow, each with 3–4 nodes.

**Cycles don't get drawn as rings.** If the last stage feeds back into the first (Krebs cycle, event loop, GC mark-and-sweep, TCP retransmit), your instinct is to place the stages around a circle. Don't. Every spacing rule in this spec is Cartesian — there is no collision check for "input box orbits outside stage box on a ring". You will get satellite boxes overlapping the stages they feed, labels sitting on the dashed circle, and tangential arrows that point nowhere. Build a stepper in HTML (see `interactive`) — each panel owns its inputs; nothing collides because nothing shares a canvas. Only fall back to a linear SVG (stages in a row, curved `<path>` return arrow) when there's one input/output total and no per-stage detail.

**Feedback loops in linear flows.** Don't draw a physical arrow traversing the layout — it fights the flow direction, clips edges, and almost always lands on top of a label. Instead, use a small `↻` glyph + text in clear airspace near the cycle point: `<text>↻ returns to start</text>`. Only restructure as a circle if the cycle IS the point.

**Arrows.** A line from A to B must not cross any other box or label. If the direct path crosses something, route around with an L-bend: `<path d="M x1 y1 L x1 ymid L x2 ymid L x2 y2"/>`. Place arrow labels in clear space, not on the midpoint.

Keep all nodes the same height when they have the same content type (all single-line = 44px, all two-line = 56px).

### Components

*Single-line node* (44px tall):

```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more about T-cells')">
  <rect x="100" y="20" width="180" height="44" rx="6"/>
  <text class="th" x="190" y="42" text-anchor="middle" dominant-baseline="central">T-cells</text>
</g>
```

*Two-line node* (56px tall):

```svg
<g class="node c-blue" onclick="sendPrompt('Tell me more about dendritic cells')">
  <rect x="100" y="20" width="200" height="56" rx="6"/>
  <text class="th" x="200" y="38" text-anchor="middle" dominant-baseline="central">Dendritic cells</text>
  <text class="ts" x="200" y="56" text-anchor="middle" dominant-baseline="central">Detect foreign antigens</text>
</g>
```

*Connector* (no label — meaning is clear from source + target):

```svg
<line x1="200" y1="76" x2="200" y2="120" class="arr" marker-end="url(#arrow)"/>
```

*Neutral node* (gray, for start/end/generic steps): `class="box"` with default text classes.

Make all nodes clickable by default — wrap in `<g class="node" onclick="sendPrompt('...')">`. The hover effect is built in.

### Streaming a flowchart in chunks

A 4-node flowchart breaks naturally into 4–6 chunks. First chunk includes `<defs>`:

1. **`defs + skeleton`** — `<defs>` arrow marker, optional swimlane backgrounds.
2. **`actor nodes`** — all the `<g class="node">` boxes.
3. **`connections`** — all the `<line class="arr">` arrows.
4. **`callouts`** — any standalone arrow labels or annotations.
5. *(optional)* **`highlight`** — accent ring on the focal node.

## Structural diagram

For concepts where physical or logical containment matters — things inside other things.

**When to use.** The explanation depends on *where* processes happen. How a cell works (organelles inside a cell), how a file system works (blocks inside inodes inside partitions), how an HVAC system works (ducts inside floors), how a CPU cache hierarchy works (L1 inside core, L2 shared).

**Core idea.** Large rounded rects are containers. Smaller rects inside them are regions or sub-structures. Text labels describe what happens in each region. Arrows show flow between regions or external inputs/outputs.

**Container rules.**

- Outermost container: large rounded rect, `rx="14"`. Use `c-{ramp}` for fill+stroke, or stay with the default `box` if the container is neutral. Label at top-left inside, 14px medium.
- Inner regions: medium rounded rects, `rx="10"`. Use a **different ramp** for regions semantically different from their parent — but most structural diagrams work fine with neutral containers and one accented region.
- 20px minimum padding inside every container — text and inner regions must not touch container edges.
- Max 2–3 nesting levels. Deeper gets unreadable at 680px.

**Layout.**

- Place inner regions side by side within the container, with 16px+ gap between them.
- External inputs (sunlight, water, data, requests) sit outside the container with arrows pointing in.
- External outputs sit outside with arrows pointing out.
- Keep external labels short — one word or a short phrase. Details go in your response text alongside the widget.

**What goes inside regions.** Text only — region name (`th` 14px medium) and a short description (`ts` 12px). Don't put flowchart-style boxes inside regions. Don't draw illustrations or icons inside.

### Structural example — library branch (chunk-friendly)

ViewBox 700×320. Color classes handle dark mode automatically.

**Chunk 1 — defs + outer container**

```svg
<defs>
  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
</defs>
<g class="c-green">
  <rect x="120" y="30" width="560" height="260" rx="14"/>
  <text class="th" x="400" y="62" text-anchor="middle">Library branch</text>
  <text class="ts" x="400" y="80" text-anchor="middle">Main floor</text>
</g>
```

**Chunk 2 — inner regions**

```svg
<g class="c-teal">
  <rect x="150" y="100" width="220" height="160" rx="10"/>
  <text class="th" x="260" y="130" text-anchor="middle">Circulation desk</text>
  <text class="ts" x="260" y="148" text-anchor="middle">Checkouts, returns</text>
</g>
<g class="c-amber">
  <rect x="450" y="100" width="210" height="160" rx="10"/>
  <text class="th" x="555" y="130" text-anchor="middle">Reading room</text>
  <text class="ts" x="555" y="148" text-anchor="middle">Seating, reference</text>
</g>
```

**Chunk 3 — flows + external input**

```svg
<text class="ts" x="410" y="175" text-anchor="middle">Books</text>
<line x1="370" y1="185" x2="448" y2="185" class="arr" marker-end="url(#arrow)"/>
<text class="ts" x="40" y="185" text-anchor="middle">New acq.</text>
<line x1="75" y1="185" x2="118" y2="185" class="arr" marker-end="url(#arrow)"/>
```

**Color in structural diagrams.** When you do use color, nested regions need distinct ramps — same class on parent and child gives identical fills and flattens the hierarchy. Pick a *related* ramp for inner structures and a *contrasting* ramp for a region doing something functionally different. The grayscale-plus-accent default still applies first: try a neutral container with one `c-blue` region before reaching for a multi-color scheme.

**Database schemas / ERDs — use mermaid.js, not SVG.** See `interactive` module.

## Illustrative diagram

For building *intuition*. The subject might be physical (an engine, a lung) or completely abstract (attention, recursion, gradient descent) — what matters is that a spatial drawing conveys the mechanism better than labelled boxes would. These are the diagrams that make someone go "oh, *that's* what it's doing."

**Two flavours, same rules:**

- **Physical subjects** get drawn as simplified versions of themselves. Cross-sections, cutaways, schematics. A water heater is a tank with a burner underneath. A lung is a branching tree in a cavity. You're drawing *the thing*, stylised.
- **Abstract subjects** get drawn as *spatial metaphors*. You're inventing a shape for something that doesn't have one — but the shape should make the mechanism obvious. A transformer is a stack of horizontal slabs with a bright thread of attention connecting tokens across layers. A hash function is a funnel scattering items into a row of buckets. The call stack is literally a stack of frames growing and shrinking. The metaphor *is* the explanation.

This is the most ambitious diagram type. Lean into it. Use colour for intensity (a hot attention weight glows amber, a cold one stays gray). Use repetition for scale (many small circles = many parameters).

**Prefer interactive over static.** A static cross-section is a good answer; one you can *operate* is a great one. The decision rule: if the real-world system has a control, give the diagram that control. A water heater has a thermostat — give the user a slider that shifts the hot/cold boundary. An LLM has input tokens — let the user click one and watch attention weights re-fan. Reach for HTML with inline SVG first; only fall back to static SVG when there's nothing to twiddle.

**When NOT to use.** The user is asking for a *reference*, not an *intuition*. "What are the components of a transformer" wants labelled boxes — that's structural. Also skip when the metaphor would be arbitrary rather than revealing: drawing "the cloud" as a cloud shape teaches nothing. If the drawing doesn't make the *mechanism* clearer, don't draw it.

**Fidelity ceiling.** These are schematics, not illustrations. Every shape should read at a glance. If a `<path>` needs more than ~6 segments, simplify it. A tank is a rounded rect, not a Bézier portrait of a tank. A flame is three triangles, not a fire. Recognisable silhouette beats accurate contour.

**Core principle.** Draw the mechanism, not a diagram *about* the mechanism. Spatial arrangement carries the meaning; labels annotate. A good illustrative diagram works with the labels removed.

### What changes from flowchart/structural rules

- **Shapes are freeform.** Use `<path>`, `<ellipse>`, `<circle>`, `<polygon>`, and curved lines to represent real forms. You are not limited to rounded rects.
- **Layout follows the subject's geometry**, not a grid. If the thing is tall and narrow, the diagram is tall and narrow. Let the subject dictate proportions within 680px width.
- **Color encodes intensity**, not category. For physical subjects: warm ramps (amber, coral, red) = heat/energy/pressure, cool ramps (blue, teal) = cold/calm, gray = inert structure. For abstract subjects: warm = active/high-weight, cool or gray = dormant/low-weight. A user should glance at the diagram and see *where the action is* without reading a label.
- **Layering and overlap are encouraged — for shapes.** Unlike flowcharts where boxes must never overlap, illustrative diagrams can layer shapes for depth — a pipe entering a tank, attention lines fanning through layers. Use z-ordering (later in source = on top) deliberately.
- **Text is the exception — never let a stroke cross it.** The overlap permission is for shapes only. Every label needs 8px of clear air between its baseline and the nearest stroke. Don't solve this with a background rect — solve it by *placing the text somewhere else*. Labels go in quiet regions: above the drawing, below it, in the margin with a leader line, or in the gap between two fans of lines. If there is no quiet region, the drawing is too dense — remove something or split into two diagrams.
- **Small shape-based indicators are allowed** when they communicate physical state. Triangles for flames. Circles for bubbles. Wavy lines for steam. Parallel lines for vibration. Keep them simple: basic SVG primitives.
- **One gradient per diagram is permitted** — the only exception to the global no-gradients rule — and only to show a *continuous* physical property across a region (temperature stratification in a tank, pressure drop along a pipe). Single `<linearGradient>` between exactly two stops from the same colour ramp. No radial gradients, no multi-stop fades, no gradient-as-aesthetic.
- **Animation is permitted for interactive HTML versions.** CSS `@keyframes` animating only `transform` and `opacity`. Loops under ~2s. Wrap every animation in `@media (prefers-reduced-motion: no-preference)`. Animations should show how the system *behaves* — convection current, rotation, flow.
- **Physical-color scenes** (sky, water, grass, materials): use ALL hardcoded hex — never mix with `c-*` theme classes. The scene should not invert. Mixing hardcoded backgrounds with theme-responsive `c-*` foreground breaks visually.

All core rules still apply (viewBox 680px, 14/12px text, pre-built classes, arrow marker, clickable nodes).

### Label placement

- Place labels *outside* the drawn object when possible, with a thin leader line (`class="leader"`) pointing to the relevant part. Keeps the illustration uncluttered.
- For large internal zones (temperature regions in a tank), labels can sit inside if there's ample clear space — minimum 20px from any edge.
- External labels sit in the margin or above/below the object. **Pick one side for labels and put them all there** — at 680px wide you don't have room for a drawing *and* label columns on both sides. Reserve at least 140px of horizontal margin on the label side. Default to **right-side labels with `text-anchor="start"`** unless geometry forces otherwise.

### Composition approach

1. Start with the main object's silhouette — the largest shape, centered in the viewBox.
2. Add internal structure: chambers, pipes, membranes, mechanical parts.
3. Add external connections: pipes entering/exiting, arrows showing flow direction, labels for inputs and outputs.
4. Add state indicators last: color fills showing temperature/pressure/concentration, small animated elements.
5. Leave generous whitespace around the object for labels.

This sequence maps directly onto streaming chunks: silhouette → internal structure → external pipes/inputs → state indicators (gradient zones) → labels.

### Illustrative example — abstract subject (attention)

A row of tokens at the bottom, one query token highlighted, weight-scaled lines fanning to every other token. Caption sits below the fan — clear of every stroke — not inside it.

```svg
<rect class="c-purple" x="60" y="40"  width="560" height="26" rx="6"/>
<rect class="c-purple" x="60" y="80"  width="560" height="26" rx="6"/>
<rect class="c-purple" x="60" y="120" width="560" height="26" rx="6"/>
<text class="ts" x="72" y="57" >Layer 3</text>
<text class="ts" x="72" y="97" >Layer 2</text>
<text class="ts" x="72" y="137">Layer 1</text>

<line stroke="#EF9F27" stroke-linecap="round" x1="340" y1="230" x2="116" y2="146" stroke-width="1"   opacity="0.25"/>
<line stroke="#EF9F27" stroke-linecap="round" x1="340" y1="230" x2="228" y2="146" stroke-width="1.5" opacity="0.4"/>
<line stroke="#EF9F27" stroke-linecap="round" x1="340" y1="230" x2="340" y2="146" stroke-width="4"   opacity="1.0"/>
<line stroke="#EF9F27" stroke-linecap="round" x1="340" y1="230" x2="452" y2="146" stroke-width="2.5" opacity="0.7"/>
<line stroke="#EF9F27" stroke-linecap="round" x1="340" y1="230" x2="564" y2="146" stroke-width="1"   opacity="0.2"/>

<g class="node" onclick="sendPrompt('What do the attention weights mean?')">
  <rect class="c-gray"  x="80"  y="230" width="72" height="36" rx="6"/>
  <rect class="c-gray"  x="192" y="230" width="72" height="36" rx="6"/>
  <rect class="c-amber" x="304" y="230" width="72" height="36" rx="6"/>
  <rect class="c-gray"  x="416" y="230" width="72" height="36" rx="6"/>
  <rect class="c-gray"  x="528" y="230" width="72" height="36" rx="6"/>
  <text class="ts" x="116" y="252" text-anchor="middle">the</text>
  <text class="ts" x="228" y="252" text-anchor="middle">cat</text>
  <text class="th" x="340" y="252" text-anchor="middle">sat</text>
  <text class="ts" x="452" y="252" text-anchor="middle">on</text>
  <text class="ts" x="564" y="252" text-anchor="middle">the</text>
</g>

<text class="ts" x="340" y="300" text-anchor="middle">Line thickness = attention weight from "sat" to each token</text>
```

Note what's *not* here: no boxes labelled "multi-head attention", no arrows labelled "Q/K/V". Those belong in the structural diagram. This one is about the *feeling* of attention — one token looking at every other token with varying intensity.

These are starting points, not ceilings. For physical subjects: add controls (thermostat slider, heating toggle), animate flows (convection currents). For attention: let the user click any token to become the query, scrub through layers. The goal is always to *show* how the thing works.
