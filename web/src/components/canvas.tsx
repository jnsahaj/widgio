import { useRef, useState } from "react";
import useSWR from "swr";
import { Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetFrame, type WidgetFrameHandle } from "@/components/widget-frame";
import { useLiveEvents } from "@/hooks/use-events";
import { fetcher, threadKey, type ThreadDetail } from "@/lib/swr";
import type { Thread, WidgetMode } from "@/lib/types";

export function Canvas({ threadId }: { threadId: string | null }) {
  const { data } = useSWR<ThreadDetail>(threadKey(threadId), fetcher, {
    revalidateOnFocus: false,
  });

  if (!threadId) {
    return (
      <main className="flex h-full items-center justify-center">
        <p className="font-mono text-[11px] text-muted-foreground/40">No widget selected</p>
      </main>
    );
  }
  if (!data) {
    return <main className="h-full" />;
  }
  // Keying on threadId resets ThreadView state (streaming flag, frame DOM,
  // applied chunks) on navigation — no manual reset effects needed.
  return <ThreadView key={threadId} thread={data.thread} initialStreaming={data.inProgress} />;
}

interface ThreadViewProps {
  thread: Thread;
  initialStreaming: boolean;
}

interface StreamState {
  caption: string;
  streaming: boolean;
  /** Final code accumulates through chunk events while streaming. */
  liveCode: string;
}

function ThreadView({ thread, initialStreaming }: ThreadViewProps) {
  const [stream, setStream] = useState<StreamState>(() => ({
    caption: initialStreaming ? "building" : "",
    streaming: initialStreaming,
    liveCode: thread.code,
  }));
  const frameRef = useRef<WidgetFrameHandle>(null);

  useLiveEvents((event) => {
    if (event.id !== thread.id) return;
    switch (event.kind) {
      case "chunk":
        if (event.label) setStream((s) => ({ ...s, caption: event.label ?? s.caption }));
        frameRef.current?.applyChunk(event.code);
        setStream((s) => ({ ...s, liveCode: s.liveCode + event.code + "\n" }));
        break;
      case "end":
        setStream((s) => ({ ...s, caption: "", streaming: false }));
        break;
      case "complete":
        // a one-shot replaced this thread mid-flight: render the final code
        setStream({ caption: "", streaming: false, liveCode: event.code });
        break;
    }
  });

  const init = stream.streaming
    ? ({ kind: "streaming" as const, mode: thread.mode, rootAttrs: thread.rootAttrs })
    : ({ kind: "static" as const, mode: thread.mode, code: stream.liveCode });

  return (
    <main className="relative flex h-full flex-col">
      {stream.streaming && <div className="progress-bar" />}
      <Toolbar
        title={thread.title}
        caption={stream.caption}
        code={stream.liveCode}
        mode={thread.mode}
      />
      <div className="scrollbar-thin flex-1 overflow-auto px-12 py-10">
        <div className="mx-auto max-w-[800px]">
          <div className="motion-safe:animate-fade-up">
            <WidgetFrame ref={frameRef} init={init} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Toolbar({
  title,
  caption,
  code,
  mode,
}: {
  title: string;
  caption: string;
  code: string;
  mode: WidgetMode;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-border/60 px-6">
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="truncate text-[13px] font-medium text-foreground">{title}</h1>
        {caption && (
          <span className="truncate font-mono text-[11px] text-muted-foreground/80">
            {caption}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <Button size="icon" variant="ghost" onClick={onCopy} title="Copy source">
          {copied ? <Check size={13} className="text-foreground" /> : <Copy size={13} />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => downloadBlob(code, title, mode)}
          title="Download"
        >
          <Download size={13} />
        </Button>
      </div>
    </div>
  );
}

function downloadBlob(code: string, title: string, mode: WidgetMode) {
  const blob = new Blob([code], { type: mode === "svg" ? "image/svg+xml" : "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "widget"}.${mode}`;
  a.click();
  URL.revokeObjectURL(url);
}
