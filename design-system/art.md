# widgio — art module

For SVG illustration and generative art: visual exploration, decorative pieces, geometric patterns, scenes.
**Read `core` first.** This module assumes the universal rules from there.

## When to use

- *"Draw me a sunset"* — illustrative scene
- *"Create a geometric pattern"* — radial symmetry, tessellations
- *"Visualize a song / mood / concept"* — abstract mood pieces
- *"Make something cool"* — open-ended generative work

For *explanatory* drawings (mechanism cross-sections), use the illustrative section of `diagram` instead.

## What's different

Art is the one place widgio relaxes the design-system rules:

- **Fill the canvas.** Art should feel rich, not sparse. Background fills are encouraged.
- **Bold colors are fine.** Mix freely. Custom `<style>` blocks with hardcoded hex are allowed here (unlike diagrams). For dark-mode variants use `@media (prefers-color-scheme: dark)`, but most art looks great as-is on widgio's black surface.
- **Layer overlapping opaque shapes for depth** — foreground elements should obscure background ones cleanly, not blend.
- **Organic forms** with `<path>` curves, `<ellipse>`, `<circle>`. Use Bézier control points for smooth shapes.
- **Texture via repetition** — parallel lines, dots, hatching — not raster effects.
- **Geometric patterns:** use `<g transform="rotate(...)">` for radial symmetry, `<g transform="translate(...)">` for tilings.
- **One gradient permitted per piece** — same rule as illustrative diagrams. Single `<linearGradient>` between two stops. Use sparingly: an evening sky from coral to deep purple, a metallic sheen, a depth gradient on water.

## Still applies

- Same SVG setup: `<svg width="100%" viewBox="0 0 680 H" role="img"><title>…</title><desc>…</desc>…`.
- viewBox width 680. Height as needed for the piece's natural proportions.
- Background transparent — widgio's surface (black) provides the canvas. If you want a non-black canvas, draw a full-viewBox `<rect>` as the first element.
- No filters (`feGaussianBlur`, `feDropShadow`, etc.). They're CPU-heavy and clash with widgio's flat aesthetic.
- No rotated text (text should always be horizontal or absent).
- Streaming chunk-by-chunk works wonderfully for art — sky, then mountains, then trees, then accent details. Each layer animates in.

## Streaming chunks for art

Layered scenes break naturally into chunks by depth:

1. **`background`** — sky gradient, base color rect, gradient defs.
2. **`mid-ground`** — distant mountains, far ocean, horizon.
3. **`fore-ground`** — primary subject (tree silhouette, building, figure).
4. **`details`** — birds, stars, ripples, accent strokes.
5. **`foreground accents`** — final highlights, sparkles.

The chunk fade-in animation makes each layer feel like it's being painted on.

## Composition notes

- **Rule of thirds.** Place focal points at 1/3 or 2/3 of the canvas, not dead center.
- **Negative space.** Don't fill every pixel — leave room for the eye to rest.
- **Color story.** Pick 3–5 colors and stick with them. A scene with sky-blue + coral-orange + deep-purple has a coherent palette; one with every color of the rainbow looks like a mistake.
- **Avoid photorealism.** widgio's strength is stylized, geometric, illustrative — not photographic detail. Lean into flat shapes, simple silhouettes, bold contrast.

## Example — minimal sunset

```svg
<svg width="100%" viewBox="0 0 680 400" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Sunset over distant mountains</title>
  <desc>A simple stylized sunset with a gradient sky, sun, layered mountain silhouettes, and a still ocean.</desc>
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1A1B3A"/>
      <stop offset="100%" stop-color="#E8593C"/>
    </linearGradient>
  </defs>

  <!-- sky -->
  <rect x="0" y="0" width="680" height="280" fill="url(#sky)"/>

  <!-- sun -->
  <circle cx="500" cy="220" r="52" fill="#FCDE5A"/>

  <!-- distant mountains -->
  <path d="M0 280 L100 200 L200 240 L320 180 L440 230 L560 190 L680 240 L680 280 Z" fill="#3C3489" opacity="0.85"/>

  <!-- closer mountains -->
  <path d="M0 290 L80 240 L180 270 L280 230 L420 280 L520 240 L680 290 L680 320 Z" fill="#26215C"/>

  <!-- ocean -->
  <rect x="0" y="320" width="680" height="80" fill="#0C447C"/>

  <!-- ocean reflection of sun -->
  <ellipse cx="500" cy="324" rx="38" ry="3" fill="#FCDE5A" opacity="0.7"/>
  <ellipse cx="500" cy="332" rx="46" ry="2" fill="#FCDE5A" opacity="0.4"/>
  <ellipse cx="500" cy="340" rx="32" ry="1.5" fill="#FCDE5A" opacity="0.25"/>

  <!-- birds -->
  <path d="M120 110 q5 -6 10 0 q5 -6 10 0" fill="none" stroke="#1A1B3A" stroke-width="1.5"/>
  <path d="M150 130 q4 -5 8 0 q4 -5 8 0" fill="none" stroke="#1A1B3A" stroke-width="1.5"/>
  <path d="M90 140 q3 -4 6 0 q3 -4 6 0" fill="none" stroke="#1A1B3A" stroke-width="1.5"/>
</svg>
```

Chunked, this would be 4 chunks: sky + gradient defs → sun → mountain layers → ocean + reflection → birds.

## Example — radial pattern

```svg
<svg width="100%" viewBox="0 0 680 680" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>Radial geometric pattern</title>
  <desc>Twelve-fold rotational symmetry built from overlapping arcs.</desc>
  <g transform="translate(340 340)">
    <g><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#5b9cff" stroke-width="1"/></g>
    <g transform="rotate(30)"><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#5DCAA5" stroke-width="1"/></g>
    <g transform="rotate(60)"><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#AFA9EC" stroke-width="1"/></g>
    <g transform="rotate(90)"><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#EF9F27" stroke-width="1"/></g>
    <g transform="rotate(120)"><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#F0997B" stroke-width="1"/></g>
    <g transform="rotate(150)"><path d="M0 -240 Q 80 -120 0 0 Q -80 -120 0 -240 Z" fill="none" stroke="#ED93B1" stroke-width="1"/></g>
    <!-- ...repeat for 180, 210, 240, 270, 300, 330 -->
  </g>
</svg>
```

Use `<g transform="rotate(...)">` blocks rather than computing each path. JavaScript can generate the rotations programmatically if you're going for higher symmetry — but inline is fine for fold counts up to 12.

## Animation in art

Use sparingly. A subtle drift, a gentle pulse, slow rotation — anything fast-paced reads as a glitch.

```css
@media (prefers-reduced-motion: no-preference) {
  .float { animation: float 8s ease-in-out infinite; }
  .pulse { animation: pulse 4s ease-in-out infinite; }
}
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
```

For SVG animations, prefer CSS over `<animate>` / `<animateTransform>` elements — CSS is more predictable and respects `prefers-reduced-motion` cleanly.
