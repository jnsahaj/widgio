import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import {
  SVG_NS,
  autoSizeIframe,
  injectSvgRuntime,
  streamingShellHtml,
  wrapCompleteHtml,
} from "@/lib/svg-runtime";
import type { WidgetMode } from "@/lib/types";

type Init =
  | { kind: "static"; mode: WidgetMode; code: string }
  | { kind: "streaming"; mode: WidgetMode; rootAttrs?: string };

export interface WidgetFrameHandle {
  applyChunk(code: string): void;
}

interface Props {
  init: Init;
}

export const WidgetFrame = forwardRef<WidgetFrameHandle, Props>(({ init }, ref) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeReadyRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";
    svgRef.current = null;
    iframeRef.current = null;
    iframeReadyRef.current = null;
    let cleanupAutoSize: (() => void) | undefined;

    if (init.kind === "static") {
      if (init.mode === "svg") {
        const wrap = document.createElement("div");
        wrap.innerHTML = init.code;
        const svg = wrap.querySelector("svg");
        if (svg) {
          ensureSvgFluidWidth(svg as SVGSVGElement);
          injectSvgRuntime(svg as SVGSVGElement);
          host.appendChild(svg);
          svgRef.current = svg as SVGSVGElement;
        } else {
          host.appendChild(wrap);
        }
      } else {
        const iframe = createIframe(wrapCompleteHtml(init.code));
        cleanupAutoSize = autoSizeIframe(iframe);
        host.appendChild(iframe);
        iframeRef.current = iframe;
      }
    } else {
      if (init.mode === "svg") {
        const svg = document.createElementNS(SVG_NS, "svg");
        const attrs = parseAttrs(
          init.rootAttrs ?? `viewBox="0 0 680 400" xmlns="${SVG_NS}"`
        );
        for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
        if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", SVG_NS);
        ensureSvgFluidWidth(svg);
        injectSvgRuntime(svg);
        const animStyle = document.createElementNS(SVG_NS, "style");
        animStyle.textContent = `
          @keyframes widgio-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
          .widgio-chunk { animation: widgio-in 0.45s ease-out both; transform-origin: center; }
        `;
        svg.appendChild(animStyle);
        host.appendChild(svg);
        svgRef.current = svg;
      } else {
        const iframe = createIframe(streamingShellHtml());
        // Wire handlers BEFORE appending — once the iframe is in the DOM,
        // srcdoc fires `load` immediately and a later listener misses.
        iframeReadyRef.current = new Promise<void>((res) => {
          iframe.addEventListener("load", () => res(), { once: true });
        });
        cleanupAutoSize = autoSizeIframe(iframe);
        host.appendChild(iframe);
        iframeRef.current = iframe;
      }
    }
    return () => {
      cleanupAutoSize?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    applyChunk(code: string) {
      if (init.kind !== "streaming") return;
      if (init.mode === "svg") appendSvgChunk(svgRef.current, code);
      else appendHtmlChunk(iframeRef.current, iframeReadyRef.current, code);
    },
  }));

  return <div ref={hostRef} className="widgio-host w-full" />;
});
WidgetFrame.displayName = "WidgetFrame";

/**
 * Iframes default to 300×150 if no width/height is set — that's the HTML
 * spec for replaced elements. Without an explicit `width: 100%` the host's
 * widget area shrinks to that default and any content wider than ~300px
 * triggers internal scrollbars. autoSizeIframe handles height; this
 * handles width.
 *
 * Background is forced transparent because the iframe element itself paints
 * an opaque white background by default (independent of the body's
 * `background: transparent`), which clashes with widgio's dark canvas.
 * `colorScheme: dark` keeps form controls inside the iframe themed for the
 * dark UI without bleeding the iframe's white-paper default through.
 *
 * We attach the load handler here before the caller appends the iframe to
 * the DOM — once it's connected, srcdoc fires `load` immediately, and a
 * later-attached listener misses the event (leaving height stuck at 150).
 */
function createIframe(srcdoc: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts allow-pointer-lock allow-popups");
  iframe.style.width = "100%";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.style.backgroundColor = "transparent";
  iframe.style.colorScheme = "dark";
  iframe.srcdoc = srcdoc;
  return iframe;
}

/**
 * Default SVGs to fluid width when the agent omitted the `width="100%"`
 * design rule. Without an explicit width, browsers render SVG at viewBox
 * dimensions or a 300×150 fallback, so omitting it produces clipped or
 * mis-sized widgets.
 */
function ensureSvgFluidWidth(svg: SVGSVGElement) {
  if (!svg.hasAttribute("width")) svg.setAttribute("width", "100%");
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) out[m[1]] = m[2];
  return out;
}

function appendSvgChunk(svg: SVGSVGElement | null, chunkCode: string) {
  if (!svg) return;
  const wrapper = `<svg xmlns="${SVG_NS}">${chunkCode}</svg>`;
  const doc = new DOMParser().parseFromString(wrapper, "image/svg+xml");
  if (doc.querySelector("parsererror")) return;
  const parsed = doc.documentElement;
  for (const node of [...parsed.childNodes]) {
    const imported = document.importNode(node, true);
    if (imported.nodeType === 1) {
      const el = imported as Element;
      const cls = el.getAttribute("class") ?? "";
      el.setAttribute("class", `${cls} widgio-chunk`.trim());
    }
    svg.appendChild(imported);
  }
}

async function appendHtmlChunk(
  iframe: HTMLIFrameElement | null,
  ready: Promise<void> | null,
  chunkCode: string
) {
  if (!iframe) return;
  if (ready) await ready;
  iframe.contentWindow?.postMessage({ type: "widgio-chunk", html: chunkCode }, "*");
}
