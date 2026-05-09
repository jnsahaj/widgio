# widgio — interactive module

For HTML widgets with controls, live state, and inline scripts: interactive explainers, steppers, ERDs, embedded charts.
**Read `core` first.** This module assumes the universal rules from there.

## Important: streaming and scripts

`<script>` tags inside chunked `widgio chunk` calls **don't execute** — `innerHTML` injection doesn't run scripts. For any widget with interactivity (sliders that update output, button handlers, Chart.js init, mermaid render, anything that needs JS to come alive), use **`widgio show` one-shot mode**, not streaming.

If you really want streaming for an interactive widget, send the static markup as chunks, then send the `<script>` block as the final chunk — but it still won't execute. There is no clean workaround in v1; just use `widgio show`.

## Layout

The widget container is ~680px wide. No card wrapper unless the content is a bounded object (see `mockup`). Whitespace is the container.

## Interactive explainer — learn how something works

*"Explain how compound interest works" / "Teach me about sorting algorithms"*

Use HTML for the controls — sliders, buttons, live readouts. Keep prose explanations in your normal response text (outside the widget call), not embedded in the HTML.

```html
<h2 class="sr-only">Compound interest calculator: shows growth of £1,000 over a chosen number of years.</h2>

<div style="display: flex; align-items: center; gap: 12px; margin: 0 0 1.5rem;">
  <label style="font-size: 14px; color: var(--color-text-secondary);">Years</label>
  <input type="range" min="1" max="40" value="20" step="1" id="years" style="flex: 1;" />
  <span style="font-size: 14px; font-weight: 500; min-width: 24px; font-family: var(--font-mono);" id="years-out">20</span>
</div>

<div style="display: flex; align-items: baseline; gap: 8px; margin: 0 0 1.5rem;">
  <span style="font-size: 14px; color: var(--color-text-secondary);">£1,000 →</span>
  <span style="font-size: 24px; font-weight: 500; font-family: var(--font-mono); letter-spacing: -0.02em;" id="result">£3,870</span>
</div>

<div style="margin: 2rem 0; position: relative; height: 240px;">
  <canvas id="chart"></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
  const fmt = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  function compute(years) {
    const rate = 0.07;
    return Array.from({ length: years + 1 }, (_, i) => Math.round(1000 * Math.pow(1 + rate, i)));
  }
  const chart = new Chart(document.getElementById('chart'), {
    type: 'line',
    data: { labels: Array.from({ length: 21 }, (_, i) => i), datasets: [{ data: compute(20), borderColor: '#3291ff', backgroundColor: 'rgba(50,145,255,0.12)', fill: true, tension: 0.2, pointRadius: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { color: '#a1a1a1' }, grid: { color: '#1f1f1f' } }, x: { ticks: { color: '#a1a1a1' }, grid: { display: false } } } }
  });
  document.getElementById('years').addEventListener('input', (e) => {
    const y = +e.target.value;
    document.getElementById('years-out').textContent = y;
    const data = compute(y);
    chart.data.labels = Array.from({ length: y + 1 }, (_, i) => i);
    chart.data.datasets[0].data = data;
    chart.update();
    document.getElementById('result').textContent = fmt.format(data[data.length - 1]);
  });
</script>
```

Use `sendPrompt()` for follow-ups that need the agent to think: `<button onclick="sendPrompt('What if I increase the rate to 10%?')">Increase rate ↗</button>`.

## Stepper — sequenced explanation (replaces ring diagrams)

For cycles, processes with discrete stages, "click through how X works" experiences. Used instead of a ring SVG for: Krebs cycle, event loop, GC mark-and-sweep, OAuth flow, CSS box model, anything cyclical.

One panel per stage, dot indicators (● ○ ○) showing position, Next wraps from the last stage back to the first — that's the loop.

```html
<h2 class="sr-only">Event loop stages: timers, pending callbacks, idle, poll, check, close.</h2>

<div id="stepper" style="margin: 0;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
    <div id="dots" style="display: flex; gap: 6px;"></div>
    <div id="counter" style="font-size: 12px; color: var(--color-text-secondary); font-family: var(--font-mono);">01 / 06</div>
  </div>
  <div id="panels"></div>
  <div style="display: flex; gap: 8px; margin-top: 1rem; justify-content: flex-end;">
    <button id="prev">Previous</button>
    <button id="next">Next</button>
  </div>
</div>

<script>
  const stages = [
    { title: 'Timers', body: 'setTimeout and setInterval callbacks scheduled to run now.' },
    { title: 'Pending callbacks', body: 'I/O callbacks deferred from the previous loop iteration.' },
    { title: 'Idle, prepare', body: 'Internal use only.' },
    { title: 'Poll', body: 'Retrieve new I/O events; execute their callbacks.' },
    { title: 'Check', body: 'setImmediate callbacks fire here.' },
    { title: 'Close', body: 'Cleanup callbacks for closed sockets, handles, etc.' },
  ];
  let i = 0;
  const dots = document.getElementById('dots');
  const panels = document.getElementById('panels');
  const counter = document.getElementById('counter');
  function render() {
    dots.innerHTML = stages.map((_, k) => `<span style="width:6px;height:6px;border-radius:50%;background:${k === i ? 'var(--color-text-primary)' : 'var(--color-border-secondary)'};"></span>`).join('');
    counter.textContent = `${String(i + 1).padStart(2, '0')} / ${String(stages.length).padStart(2, '0')}`;
    const s = stages[i];
    panels.innerHTML = `
      <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-lg); padding: 1.25rem 1.5rem; min-height: 120px;">
        <h3 style="margin: 0 0 8px;">${s.title}</h3>
        <p style="margin: 0; color: var(--color-text-secondary);">${s.body}</p>
      </div>`;
  }
  document.getElementById('prev').onclick = () => { i = (i - 1 + stages.length) % stages.length; render(); };
  document.getElementById('next').onclick = () => { i = (i + 1) % stages.length; render(); };
  render();
</script>
```

The wrap on Next is what conveys the cycle. No ring decoration; the loop is implicit in the navigation.

## ERD / class diagram via mermaid.js

Database schemas — use mermaid's `erDiagram`, not hand-drawn SVG. Layout, cardinality, and connector routing are free.

```html
<style>
  #erd svg.erDiagram .divider path { stroke-opacity: 0.5; }
  #erd svg.erDiagram .row-rect-odd path,
  #erd svg.erDiagram .row-rect-odd rect,
  #erd svg.erDiagram .row-rect-even path,
  #erd svg.erDiagram .row-rect-even rect { stroke: none !important; }
</style>
<div id="erd"></div>
<script type="module">
  import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
  await document.fonts.ready;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    themeVariables: {
      darkMode: true,
      fontSize: '13px',
      fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
      lineColor: '#666',
      textColor: '#a1a1a1',
      mainBkg: '#0a0a0a',
      primaryColor: '#0a0a0a',
      primaryBorderColor: '#2a2a2a',
      primaryTextColor: '#fafafa',
    },
  });
  const { svg } = await mermaid.render('erd-svg', `erDiagram
    USERS ||--o{ POSTS : writes
    POSTS ||--o{ COMMENTS : has
    USERS {
      uuid id PK
      string email
      timestamp created_at
    }
    POSTS {
      uuid id PK
      uuid user_id FK
      string title
    }`);
  document.getElementById('erd').innerHTML = svg;

  // Round outermost entity boxes (mermaid default is sharp paths)
  document.querySelectorAll('#erd svg.erDiagram .node').forEach(node => {
    const firstPath = node.querySelector('path[d]');
    if (!firstPath) return;
    const d = firstPath.getAttribute('d');
    const nums = d.match(/-?[\d.]+/g)?.map(Number);
    if (!nums || nums.length < 8) return;
    const xs = [nums[0], nums[2], nums[4], nums[6]];
    const ys = [nums[1], nums[3], nums[5], nums[7]];
    const x = Math.min(...xs), y = Math.min(...ys);
    const w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x); rect.setAttribute('y', y);
    rect.setAttribute('width', w); rect.setAttribute('height', h);
    rect.setAttribute('rx', '6');
    for (const a of ['fill', 'stroke', 'stroke-width', 'class', 'style']) {
      if (firstPath.hasAttribute(a)) rect.setAttribute(a, firstPath.getAttribute(a));
    }
    firstPath.replaceWith(rect);
  });
</script>
```

Works identically for `classDiagram` — swap the diagram source; init stays the same.

## Animation rules

- CSS `@keyframes` only, animating `transform` and `opacity` (cheap, GPU-accelerated). Avoid animating `width`, `height`, `top`, `left` — they trigger layout.
- Loops under ~2s. Anything longer feels broken.
- Wrap every animation in `@media (prefers-reduced-motion: no-preference)` so it's opt-out by default:

```css
@media (prefers-reduced-motion: no-preference) {
  .pulse { animation: pulse 1.6s ease-in-out infinite; }
}
@keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
```

- Animations should show how the system *behaves* (convection current, rotation, flow), not decorate. If removing the animation makes the widget less useful, keep it.
- No physics engines or heavy libraries.

## Loading external scripts

The iframe sandbox allows `allow-scripts`, so external scripts work. Use the standard CDN allowlist (`cdnjs.cloudflare.com`, `esm.sh`, `cdn.jsdelivr.net`, `unpkg.com`).

For UMD globals (Chart.js, D3, Three.js): `<script src="https://cdnjs.cloudflare.com/ajax/libs/...">` then a plain `<script>` that uses the global.

For ES modules (mermaid, modern libs): `<script type="module">import x from 'https://esm.sh/...'</script>`.

Scripts execute after the iframe loads — they run in source order. Put libraries first, then your widget code.

## Inputs and form elements

widgio's iframe shell ships with pre-styled inputs, selects, textareas, buttons, and range sliders that match the dark theme. Write bare `<input>` etc. tags — don't add inline styles for normal cases. Override only when you need a different size or layout.

```html
<input type="text" placeholder="Enter your name">
<input type="number" min="0" max="100" value="20">
<select><option>One</option><option>Two</option></select>
<input type="range" min="0" max="100" value="50">
<textarea placeholder="Notes"></textarea>
<button>Submit</button>
```

For `sendPrompt` buttons, suffix the label with ` ↗`:

```html
<button onclick="sendPrompt('Show me the API docs')">View docs ↗</button>
```

## Round every displayed number

JS float math leaks artifacts. Any number reaching the screen — slider readouts, stat cards, axis labels, tooltips, totals — goes through `Math.round()`, `.toFixed(n)`, or `Intl.NumberFormat`. For range sliders, set `step="1"` (or `0.1` etc.) so the input itself emits round values.
