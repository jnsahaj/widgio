export const SVG_NS = "http://www.w3.org/2000/svg";

export const SVG_RUNTIME_CSS = `
  text { font-family: var(--font-sans, system-ui); letter-spacing: -0.005em; }
  .t  { font-size: 14px; font-weight: 400; fill: var(--color-text-primary, #fafafa); }
  .ts { font-size: 12px; font-weight: 400; fill: var(--color-text-secondary, #a1a1a1); }
  .th { font-size: 14px; font-weight: 500; fill: var(--color-text-primary, #fafafa); letter-spacing: -0.01em; }
  .tm { font-family: var(--font-mono, ui-monospace); font-size: 12px; font-weight: 400; fill: var(--color-text-secondary, #a1a1a1); letter-spacing: 0; }
  .box { fill: var(--color-background-secondary, #0a0a0a); stroke: var(--color-border-secondary, #2a2a2a); stroke-width: 1; }
  .node { cursor: pointer; transition: opacity 0.15s, transform 0.08s; }
  .node:hover { opacity: 0.86; }
  .arr { stroke: var(--color-text-secondary, #a1a1a1); stroke-width: 1; fill: none; stroke-linecap: round; }
  .leader { stroke: var(--color-text-tertiary, #666); stroke-width: 0.75; fill: none; stroke-dasharray: 2 3; }

  .c-purple, .c-purple > rect, .c-purple > circle, .c-purple > ellipse,
  rect.c-purple, circle.c-purple, ellipse.c-purple { fill: #2A2566; stroke: #8C84D9; stroke-width: 1; }
  .c-purple > .t, .c-purple > .th, .c-purple .t, .c-purple .th { fill: #D8D4F8; }
  .c-purple > .ts, .c-purple .ts { fill: #8C84D9; }

  .c-teal, .c-teal > rect, .c-teal > circle, .c-teal > ellipse,
  rect.c-teal, circle.c-teal, ellipse.c-teal { fill: #003D33; stroke: #4DBE9B; stroke-width: 1; }
  .c-teal > .t, .c-teal > .th, .c-teal .t, .c-teal .th { fill: #B2EAD6; }
  .c-teal > .ts, .c-teal .ts { fill: #4DBE9B; }

  .c-coral, .c-coral > rect, .c-coral > circle, .c-coral > ellipse,
  rect.c-coral, circle.c-coral, ellipse.c-coral { fill: #5A1F0E; stroke: #E88563; stroke-width: 1; }
  .c-coral > .t, .c-coral > .th, .c-coral .t, .c-coral .th { fill: #F5C9B8; }
  .c-coral > .ts, .c-coral .ts { fill: #E88563; }

  .c-pink, .c-pink > rect, .c-pink > circle, .c-pink > ellipse,
  rect.c-pink, circle.c-pink, ellipse.c-pink { fill: #5A1A30; stroke: #E47AA0; stroke-width: 1; }
  .c-pink > .t, .c-pink > .th, .c-pink .t, .c-pink .th { fill: #F5C5D7; }
  .c-pink > .ts, .c-pink .ts { fill: #E47AA0; }

  .c-gray, .c-gray > rect, .c-gray > circle, .c-gray > ellipse,
  rect.c-gray, circle.c-gray, ellipse.c-gray { fill: #161616; stroke: #444; stroke-width: 1; }
  .c-gray > .t, .c-gray > .th, .c-gray .t, .c-gray .th { fill: #d4d4d4; }
  .c-gray > .ts, .c-gray .ts { fill: #888; }

  .c-blue, .c-blue > rect, .c-blue > circle, .c-blue > ellipse,
  rect.c-blue, circle.c-blue, ellipse.c-blue { fill: #002F66; stroke: #3291FF; stroke-width: 1; }
  .c-blue > .t, .c-blue > .th, .c-blue .t, .c-blue .th { fill: #BCDDFF; }
  .c-blue > .ts, .c-blue .ts { fill: #3291FF; }

  .c-green, .c-green > rect, .c-green > circle, .c-green > ellipse,
  rect.c-green, circle.c-green, ellipse.c-green { fill: #0F3D08; stroke: #87C84B; stroke-width: 1; }
  .c-green > .t, .c-green > .th, .c-green .t, .c-green .th { fill: #C8E5A2; }
  .c-green > .ts, .c-green .ts { fill: #87C84B; }

  .c-amber, .c-amber > rect, .c-amber > circle, .c-amber > ellipse,
  rect.c-amber, circle.c-amber, ellipse.c-amber { fill: #4A2A04; stroke: #F5A623; stroke-width: 1; }
  .c-amber > .t, .c-amber > .th, .c-amber .t, .c-amber .th { fill: #FBD89A; }
  .c-amber > .ts, .c-amber .ts { fill: #F5A623; }

  .c-red, .c-red > rect, .c-red > circle, .c-red > ellipse,
  rect.c-red, circle.c-red, ellipse.c-red { fill: #5A0F0F; stroke: #FF6B6B; stroke-width: 1; }
  .c-red > .t, .c-red > .th, .c-red .t, .c-red .th { fill: #FCC8C8; }
  .c-red > .ts, .c-red .ts { fill: #FF6B6B; }
`;

export const IFRAME_TOKEN_CSS = `
  :root {
    color-scheme: dark;
    --color-background-primary: #000;
    --color-background-secondary: #0a0a0a;
    --color-background-tertiary: #111;
    --color-background-info: rgba(50,145,255,.12);
    --color-background-danger: rgba(255,77,79,.12);
    --color-background-success: rgba(98,224,170,.12);
    --color-background-warning: rgba(245,166,35,.12);
    --color-text-primary: #fafafa;
    --color-text-secondary: #a1a1a1;
    --color-text-tertiary: #666;
    --color-text-info: #3291ff;
    --color-text-danger: #ff4d4f;
    --color-text-success: #62e0aa;
    --color-text-warning: #f5a623;
    --color-border-tertiary: #1f1f1f;
    --color-border-secondary: #2a2a2a;
    --color-border-primary: #444;
    --color-border-info: #0070f3;
    --color-border-danger: #e00;
    --color-border-success: #2ea043;
    --color-border-warning: #f5a623;
    --border-radius-sm: 4px;
    --border-radius-md: 6px;
    --border-radius-lg: 10px;
    --border-radius-xl: 14px;
    --font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-serif: ui-serif, Georgia, "Times New Roman", serif;
    --font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --p: var(--color-text-primary);
    --s: var(--color-text-secondary);
    --t: var(--color-text-tertiary);
    --bg2: var(--color-background-secondary);
    --b: var(--color-border-tertiary);
  }
  body { margin: 0; padding: 0; box-sizing: border-box;
    font-family: var(--font-sans); font-size: 13px; line-height: 1.5;
    color: var(--color-text-primary); background: transparent;
    -webkit-font-smoothing: antialiased; }
  h1 { font-size: 22px; font-weight: 500; letter-spacing: -0.02em; margin: 0 0 1rem; }
  h2 { font-size: 18px; font-weight: 500; letter-spacing: -0.015em; margin: 0 0 .75rem; }
  h3 { font-size: 16px; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 .5rem; }
  p { margin: 0 0 .75rem; line-height: 1.7; }
  a { color: var(--color-text-info); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code, pre { font-family: var(--font-mono); font-size: 12.5px; }
  code { background: var(--color-background-secondary); padding: 1px 6px; border-radius: var(--border-radius-sm); border: 1px solid var(--color-border-tertiary); }
  pre code { background: transparent; padding: 0; border: 0; }
  hr { border: 0; border-top: 1px solid var(--color-border-tertiary); margin: 1.5rem 0; }
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type="text"], input[type="email"], input[type="number"], input[type="date"], select, textarea {
    height: 36px; padding: 0 12px; background: var(--color-background-secondary);
    border: 1px solid var(--color-border-secondary); border-radius: var(--border-radius-md);
    transition: border-color .15s, box-shadow .15s;
  }
  textarea { height: auto; min-height: 80px; padding: 10px 12px; resize: vertical; }
  input:hover, select:hover, textarea:hover { border-color: var(--color-border-primary); }
  input:focus, select:focus, textarea:focus { outline: 0; border-color: var(--color-text-info); box-shadow: 0 0 0 3px var(--color-background-info); }
  button {
    height: 32px; padding: 0 14px; background: var(--color-background-secondary);
    border: 1px solid var(--color-border-secondary); border-radius: var(--border-radius-md);
    color: var(--color-text-primary); cursor: pointer; font-weight: 500; letter-spacing: -0.005em;
    transition: background .12s, border-color .12s, transform .08s;
  }
  button:hover { background: var(--color-background-tertiary); border-color: var(--color-border-primary); }
  button:active { transform: scale(0.98); }
  input[type="range"] { height: 24px; padding: 0; background: transparent; border: 0; -webkit-appearance: none; appearance: none; }
  input[type="range"]::-webkit-slider-runnable-track { height: 4px; background: var(--color-border-tertiary); border-radius: 999px; }
  input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%; background: var(--color-text-primary); margin-top: -7px; cursor: pointer; }
  input[type="range"]::-moz-range-track { height: 4px; background: var(--color-border-tertiary); border-radius: 999px; }
  input[type="range"]::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: var(--color-text-primary); cursor: pointer; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
`;

export const IFRAME_HEAD_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">`;

export function injectSvgRuntime(svgEl: SVGSVGElement) {
  if (svgEl.querySelector("style[data-widgio-runtime]")) return;
  const style = document.createElementNS(SVG_NS, "style");
  style.setAttribute("data-widgio-runtime", "1");
  style.textContent = SVG_RUNTIME_CSS;
  svgEl.insertBefore(style, svgEl.firstChild);
}

/**
 * Inline script that runs INSIDE every widget iframe. The sandbox blocks the
 * parent from reading `iframe.contentDocument`, so the iframe has to report
 * its own size via postMessage. ResizeObserver + MutationObserver catch
 * size changes from JS (chart libraries, dynamic content, etc.).
 */
const IFRAME_RUNTIME_SCRIPT = `
  window.sendPrompt = (t) => parent.postMessage({type:"sendPrompt",text:t}, "*");
  window.openLink = (u) => parent.postMessage({type:"openLink",url:u}, "*");
  (function() {
    var lastH = -1;
    var report = function() {
      var h = Math.max(
        document.body ? document.body.scrollHeight : 0,
        document.documentElement ? document.documentElement.scrollHeight : 0
      );
      if (h === lastH) return;
      lastH = h;
      parent.postMessage({type:"widgio-size", height:h}, "*");
    };
    var start = function() {
      report();
      try {
        new ResizeObserver(report).observe(document.body);
        new MutationObserver(report).observe(document.body, {childList:true, subtree:true, attributes:true});
      } catch (e) {}
      window.addEventListener("load", report);
    };
    if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
  })();
`;

export function streamingShellHtml(): string {
  return `<!doctype html><html><head>
${IFRAME_HEAD_LINKS}
<style>${IFRAME_TOKEN_CSS}
.widgio-chunk { animation: widgio-in 0.45s ease-out both; }
@keyframes widgio-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
</style></head><body>
<div id="root"></div>
<script>
${IFRAME_RUNTIME_SCRIPT}
window.addEventListener("message", (e) => {
  const d = e.data;
  if (d && d.type === "widgio-chunk" && typeof d.html === "string") {
    const root = document.getElementById("root");
    const tmp = document.createElement("div");
    tmp.innerHTML = d.html;
    for (const node of [...tmp.childNodes]) {
      if (node.nodeType === 1) node.classList.add("widgio-chunk");
      root.appendChild(node);
    }
  }
});
<\/script>
</body></html>`;
}

export function wrapCompleteHtml(code: string): string {
  return `<!doctype html><html><head>
${IFRAME_HEAD_LINKS}
<style>${IFRAME_TOKEN_CSS}</style></head><body>${code}
<script>
${IFRAME_RUNTIME_SCRIPT}
<\/script></body></html>`;
}

/**
 * Listen for height reports from the iframe (since sandboxed iframes block
 * cross-frame DOM access, the iframe has to tell us how tall it wants to be).
 * Returns a cleanup function that removes the listener.
 */
export function autoSizeIframe(iframe: HTMLIFrameElement): () => void {
  const onMessage = (e: MessageEvent) => {
    if (e.source !== iframe.contentWindow) return;
    const data = e.data;
    if (data && data.type === "widgio-size" && typeof data.height === "number") {
      iframe.style.height = `${Math.max(data.height, 1)}px`;
    }
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
}
