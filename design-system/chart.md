# widgio — chart module

For data visualization with axes, legends, tooltips: bar, line, scatter, pie, donut, waterfall, etc. Built on Chart.js.
**Read `core` first.** This module assumes the universal rules from there.

**Streaming caveat:** Chart.js needs `<script>` to run, so use **`widgio show` one-shot mode** — not chunked streaming. See `interactive` for why.

## Boilerplate

```html
<h2 class="sr-only">Bar chart of quarterly revenue, Q1 through Q4.</h2>

<div style="position: relative; width: 100%; height: 300px;">
  <canvas id="myChart" role="img" aria-label="Bar chart of quarterly revenue, Q1 through Q4">Quarterly revenue: Q1 12, Q2 19, Q3 8, Q4 15.</canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
  Chart.defaults.color = '#a8a8a8';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';
  Chart.defaults.font.size = 12;

  new Chart(document.getElementById('myChart'), {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: 'Revenue',
        data: [12, 19, 8, 15],
        backgroundColor: '#5b9cff',
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' } },
        x: { grid: { display: false } }
      }
    }
  });
</script>
```

## Chart.js rules

- Every `<canvas>` MUST have `role="img"` and a descriptive `aria-label` summarizing what the chart shows, plus fallback text between the tags. Without these the chart is invisible to screen readers.
- **Never rely on color alone** to distinguish data series. Pair each color with a secondary visual cue — dash pattern for lines, marker shape for scatter, fill pattern/hatching for bars and pie slices — and show both in the legend.
- **Canvas cannot resolve CSS variables.** Use hardcoded hex (or read from `getComputedStyle` if you really need to track theme variables, but the iframe is forced-dark already).
- **Wrap `<canvas>` in `<div>` with explicit `height` and `position: relative`.** Set height ONLY on the wrapper, never on the canvas element itself. Use `responsive: true, maintainAspectRatio: false` in Chart.js options.
- **Horizontal bar charts:** wrapper div height should be at least `(number_of_bars × 40) + 80` pixels.
- Load UMD build via `<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js">` — sets `window.Chart` global. Follow with a plain `<script>` (no `type="module"`).
- Multiple charts: use unique IDs (`myChart1`, `myChart2`). Each gets its own canvas+div pair.
- **Bubble and scatter charts:** bubble radii extend past their center points, so points near axis boundaries get clipped. Pad the scale range — set `scales.y.min` and `scales.y.max` ~10% beyond your data range (same for x). Or use `layout: { padding: 20 }` as a blunt fallback.
- Chart.js auto-skips x-axis labels when they'd overlap. If you have ≤12 categories and need all labels visible (waterfall, monthly series), set `scales.x.ticks: { autoSkip: false, maxRotation: 45 }` — missing labels make bars unidentifiable.

## Color palette for charts

Hardcode hex from widgio's color palette (since canvas can't read CSS variables). For dark mode, prefer the 200/400 stops (mid-bright):

```js
const palette = {
  blue:   '#5b9cff',  // primary
  teal:   '#5DCAA5',
  purple: '#AFA9EC',
  amber:  '#EF9F27',
  green:  '#97C459',
  coral:  '#F0997B',
  pink:   '#ED93B1',
  red:    '#F09595',
  gray:   '#a8a8a8',
};
```

Encode meaning, not sequence. Don't cycle through colors decoratively. 2–3 colors per chart unless data is genuinely categorical with many groups.

## Number formatting

**Round every displayed number.** Use a formatter for axes and tooltips:

```js
options: {
  scales: {
    y: { ticks: { callback: (v) => '$' + v.toLocaleString() } }
  },
  plugins: {
    tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}` } }
  }
}
```

**Negative values:** `-$5M` not `$-5M` — sign before currency symbol. Use a formatter: `(v) => (v < 0 ? '-' : '') + '$' + Math.abs(v) + 'M'`.

## Legends — always disable Chart.js default and build custom HTML

The default legend uses round dots and no values; custom HTML gives small squares, tight spacing, and percentages.

```js
plugins: { legend: { display: false } }
```

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 8px; font-size: 12px; color: var(--color-text-secondary);">
  <span style="display: flex; align-items: center; gap: 4px;">
    <span style="width: 10px; height: 10px; border-radius: 2px; background: #5b9cff;"></span>
    Chrome 65%
  </span>
  <span style="display: flex; align-items: center; gap: 4px;">
    <span style="width: 10px; height: 10px; border-radius: 2px; background: #5DCAA5;"></span>
    Safari 18%
  </span>
</div>
```

Include the value/percentage in each label when the data is categorical (pie, donut, single-series bar). Position the legend above the chart (`margin-bottom`) or below (`margin-top`) — not inside the canvas.

## Dashboard layout

For a multi-stat dashboard: wrap summary numbers in metric cards above the chart (see `mockup` module). The chart canvas flows below without a card wrapper. Use `sendPrompt()` for drill-downs:

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 1.5rem;">
  <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 1rem;">
    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Total revenue</div>
    <div style="font-size: 24px; font-weight: 500;">$54,200</div>
  </div>
  <div style="background: var(--color-background-secondary); border-radius: var(--border-radius-md); padding: 1rem;">
    <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: 4px;">Best quarter</div>
    <div style="font-size: 24px; font-weight: 500;">Q2</div>
  </div>
</div>

<div style="position: relative; width: 100%; height: 280px;">
  <canvas id="chart" role="img" aria-label="..."></canvas>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>/* chart init */</script>

<div style="margin-top: 1rem; display: flex; gap: 8px;">
  <button onclick="sendPrompt('Break down Q4 by region')">Drill into Q4 ↗</button>
  <button onclick="sendPrompt('Compare with last year')">Compare YoY ↗</button>
</div>
```

## Common chart types — quick reference

**Line** (time series, trends):
```js
{ type: 'line', options: { elements: { line: { tension: 0.2 }, point: { radius: 0 } } } }
```

**Stacked bar** (composition over categories):
```js
{ type: 'bar', options: { scales: { x: { stacked: true }, y: { stacked: true } } } }
```

**Donut** (composition, single dimension):
```js
{ type: 'doughnut', options: { cutout: '65%', plugins: { legend: { display: false } } } }
```

**Horizontal bar** (long category labels, ranking):
```js
{ type: 'bar', options: { indexAxis: 'y' } }
```

**Scatter** (correlation, distribution):
```js
{ type: 'scatter', options: { scales: { x: { type: 'linear' } } } }
```
