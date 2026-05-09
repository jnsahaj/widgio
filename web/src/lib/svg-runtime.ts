export const SVG_NS = "http://www.w3.org/2000/svg";

export const SVG_RUNTIME_CSS = `
  text { font-family: var(--font-sans, system-ui); }
  .t  { font-size: 14px; font-weight: 400; fill: var(--color-text-primary, #ededed); }
  .ts { font-size: 12px; font-weight: 400; fill: var(--color-text-secondary, #a8a8a8); }
  .th { font-size: 14px; font-weight: 500; fill: var(--color-text-primary, #ededed); }
  .box { fill: var(--color-background-secondary, #141414); stroke: var(--color-border-tertiary, rgba(255,255,255,.08)); stroke-width: 0.5; }
  .node { cursor: pointer; transition: opacity 0.15s; }
  .node:hover { opacity: 0.78; }
  .arr { stroke: var(--color-text-secondary, #a8a8a8); stroke-width: 1.5; fill: none; stroke-linecap: round; }
  .leader { stroke: var(--color-text-tertiary, #6e6e6e); stroke-width: 0.5; fill: none; stroke-dasharray: 2 3; }

  .c-purple, .c-purple > rect, .c-purple > circle, .c-purple > ellipse,
  rect.c-purple, circle.c-purple, ellipse.c-purple { fill: #3C3489; stroke: #AFA9EC; stroke-width: 0.5; }
  .c-purple > .t, .c-purple > .th, .c-purple .t, .c-purple .th { fill: #CECBF6; }
  .c-purple > .ts, .c-purple .ts { fill: #AFA9EC; }

  .c-teal, .c-teal > rect, .c-teal > circle, .c-teal > ellipse,
  rect.c-teal, circle.c-teal, ellipse.c-teal { fill: #085041; stroke: #5DCAA5; stroke-width: 0.5; }
  .c-teal > .t, .c-teal > .th, .c-teal .t, .c-teal .th { fill: #9FE1CB; }
  .c-teal > .ts, .c-teal .ts { fill: #5DCAA5; }

  .c-coral, .c-coral > rect, .c-coral > circle, .c-coral > ellipse,
  rect.c-coral, circle.c-coral, ellipse.c-coral { fill: #712B13; stroke: #F0997B; stroke-width: 0.5; }
  .c-coral > .t, .c-coral > .th, .c-coral .t, .c-coral .th { fill: #F5C4B3; }
  .c-coral > .ts, .c-coral .ts { fill: #F0997B; }

  .c-pink, .c-pink > rect, .c-pink > circle, .c-pink > ellipse,
  rect.c-pink, circle.c-pink, ellipse.c-pink { fill: #72243E; stroke: #ED93B1; stroke-width: 0.5; }
  .c-pink > .t, .c-pink > .th, .c-pink .t, .c-pink .th { fill: #F4C0D1; }
  .c-pink > .ts, .c-pink .ts { fill: #ED93B1; }

  .c-gray, .c-gray > rect, .c-gray > circle, .c-gray > ellipse,
  rect.c-gray, circle.c-gray, ellipse.c-gray { fill: #444441; stroke: #B4B2A9; stroke-width: 0.5; }
  .c-gray > .t, .c-gray > .th, .c-gray .t, .c-gray .th { fill: #D3D1C7; }
  .c-gray > .ts, .c-gray .ts { fill: #B4B2A9; }

  .c-blue, .c-blue > rect, .c-blue > circle, .c-blue > ellipse,
  rect.c-blue, circle.c-blue, ellipse.c-blue { fill: #0C447C; stroke: #85B7EB; stroke-width: 0.5; }
  .c-blue > .t, .c-blue > .th, .c-blue .t, .c-blue .th { fill: #B5D4F4; }
  .c-blue > .ts, .c-blue .ts { fill: #85B7EB; }

  .c-green, .c-green > rect, .c-green > circle, .c-green > ellipse,
  rect.c-green, circle.c-green, ellipse.c-green { fill: #27500A; stroke: #97C459; stroke-width: 0.5; }
  .c-green > .t, .c-green > .th, .c-green .t, .c-green .th { fill: #C0DD97; }
  .c-green > .ts, .c-green .ts { fill: #97C459; }

  .c-amber, .c-amber > rect, .c-amber > circle, .c-amber > ellipse,
  rect.c-amber, circle.c-amber, ellipse.c-amber { fill: #633806; stroke: #EF9F27; stroke-width: 0.5; }
  .c-amber > .t, .c-amber > .th, .c-amber .t, .c-amber .th { fill: #FAC775; }
  .c-amber > .ts, .c-amber .ts { fill: #EF9F27; }

  .c-red, .c-red > rect, .c-red > circle, .c-red > ellipse,
  rect.c-red, circle.c-red, ellipse.c-red { fill: #791F1F; stroke: #F09595; stroke-width: 0.5; }
  .c-red > .t, .c-red > .th, .c-red .t, .c-red .th { fill: #F7C1C1; }
  .c-red > .ts, .c-red .ts { fill: #F09595; }
`;

export const IFRAME_TOKEN_CSS = `
  :root {
    color-scheme: dark;
    --color-background-primary: #0d0d0d;
    --color-background-secondary: #141414;
    --color-background-tertiary: #000000;
    --color-background-info: rgba(91,156,255,.12);
    --color-background-danger: rgba(255,112,112,.12);
    --color-background-success: rgba(74,222,128,.12);
    --color-background-warning: rgba(245,191,100,.12);
    --color-text-primary: #ededed;
    --color-text-secondary: #a8a8a8;
    --color-text-tertiary: #6e6e6e;
    --color-text-info: #5b9cff;
    --color-text-danger: #ff7070;
    --color-text-success: #4ade80;
    --color-text-warning: #f5bf64;
    --color-border-tertiary: rgba(255,255,255,.08);
    --color-border-secondary: rgba(255,255,255,.16);
    --color-border-primary: rgba(255,255,255,.24);
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-xl: 16px;
    --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-serif: ui-serif, Georgia, "Times New Roman", serif;
    --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    --p: var(--color-text-primary);
    --s: var(--color-text-secondary);
    --t: var(--color-text-tertiary);
    --bg2: var(--color-background-secondary);
    --b: var(--color-border-tertiary);
  }
  body { margin: 0; padding: 0; box-sizing: border-box;
    font-family: var(--font-sans); font-size: 13px; line-height: 1.5;
    color: var(--color-text-primary); background: transparent; }
  h1 { font-size: 22px; font-weight: 500; margin: 0 0 1rem; }
  h2 { font-size: 18px; font-weight: 500; margin: 0 0 .75rem; }
  h3 { font-size: 16px; font-weight: 500; margin: 0 0 .5rem; }
  p { margin: 0 0 .75rem; line-height: 1.7; }
  a { color: var(--color-text-info); text-decoration: none; }
  a:hover { text-decoration: underline; }
  code, pre { font-family: var(--font-mono); }
  hr { border: 0; border-top: 0.5px solid var(--color-border-tertiary); margin: 1.5rem 0; }
  input, select, textarea, button { font: inherit; color: inherit; }
  input[type="text"], input[type="email"], input[type="number"], input[type="date"], select, textarea {
    height: 36px; padding: 0 12px; background: var(--color-background-primary);
    border: 0.5px solid var(--color-border-tertiary); border-radius: var(--border-radius-md);
    transition: border-color .15s, box-shadow .15s;
  }
  textarea { height: auto; min-height: 80px; padding: 10px 12px; resize: vertical; }
  input:hover, select:hover, textarea:hover { border-color: var(--color-border-secondary); }
  input:focus, select:focus, textarea:focus { outline: 0; border-color: var(--color-border-primary); box-shadow: 0 0 0 3px var(--color-background-info); }
  button {
    height: 32px; padding: 0 14px; background: transparent;
    border: 0.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md);
    color: var(--color-text-primary); cursor: pointer;
    transition: background .12s, border-color .12s, transform .08s;
  }
  button:hover { background: var(--color-background-secondary); border-color: var(--color-border-primary); }
  button:active { transform: scale(0.98); }
`;

export const IFRAME_HEAD_LINKS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">`;

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
