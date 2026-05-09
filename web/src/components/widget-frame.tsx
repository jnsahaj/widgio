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

    if (init.kind === "static") {
      if (init.mode === "svg") {
        const wrap = document.createElement("div");
        wrap.innerHTML = init.code;
        const svg = wrap.querySelector("svg");
        if (svg) {
          injectSvgRuntime(svg as SVGSVGElement);
          host.appendChild(svg);
          svgRef.current = svg as SVGSVGElement;
        } else {
          host.appendChild(wrap);
        }
      } else {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts allow-pointer-lock allow-popups");
        iframe.srcdoc = wrapCompleteHtml(init.code);
        host.appendChild(iframe);
        iframeRef.current = iframe;
        autoSizeIframe(iframe);
      }
    } else {
      if (init.mode === "svg") {
        const svg = document.createElementNS(SVG_NS, "svg");
        const attrs = parseAttrs(
          init.rootAttrs ?? `viewBox="0 0 680 400" xmlns="${SVG_NS}"`
        );
        for (const [k, v] of Object.entries(attrs)) svg.setAttribute(k, v);
        if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", SVG_NS);
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
        const iframe = document.createElement("iframe");
        iframe.setAttribute("sandbox", "allow-scripts allow-pointer-lock allow-popups");
        iframe.srcdoc = streamingShellHtml();
        host.appendChild(iframe);
        iframeRef.current = iframe;
        iframeReadyRef.current = new Promise<void>((res) => {
          iframe.addEventListener("load", () => res(), { once: true });
        });
        autoSizeIframe(iframe);
      }
    }
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
