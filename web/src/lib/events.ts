import type { WidgetEvent } from "./types";

export type EventStatus = "connecting" | "connected" | "disconnected";

type EventListener = (event: WidgetEvent) => void;
type StatusListener = (status: EventStatus) => void;

/**
 * Singleton SSE bus.
 *
 * One EventSource per app load (`advanced-init-once`). Components subscribe
 * lazily; the connection auto-opens on first subscriber and stays open for the
 * page lifetime. Chunks fan out via callbacks (imperative consumers — chunks
 * mutate the live SVG DOM); status fans out via `useSyncExternalStore`.
 */
class EventBus {
  private es: EventSource | null = null;
  private retry: number | null = null;
  private status: EventStatus = "connecting";
  private events = new Set<EventListener>();
  private statusSubs = new Set<StatusListener>();

  private connect() {
    if (this.es) return;
    this.setStatus("connecting");
    const es = new EventSource("/events");
    this.es = es;
    es.addEventListener("widget", (e) => {
      try {
        const ev = JSON.parse((e as MessageEvent).data) as WidgetEvent;
        for (const fn of this.events) fn(ev);
      } catch {
        // ignore malformed
      }
    });
    es.onopen = () => this.setStatus("connected");
    es.onerror = () => {
      this.setStatus("disconnected");
      this.es?.close();
      this.es = null;
      if (this.retry == null) {
        this.retry = window.setTimeout(() => {
          this.retry = null;
          if (this.events.size + this.statusSubs.size > 0) this.connect();
        }, 1500);
      }
    };
  }

  private setStatus(next: EventStatus) {
    if (this.status === next) return;
    this.status = next;
    for (const fn of this.statusSubs) fn(next);
  }

  subscribeEvents(fn: EventListener): () => void {
    this.connect();
    this.events.add(fn);
    return () => {
      this.events.delete(fn);
    };
  }

  subscribeStatus(fn: StatusListener): () => void {
    this.connect();
    this.statusSubs.add(fn);
    return () => {
      this.statusSubs.delete(fn);
    };
  }

  getStatus(): EventStatus {
    return this.status;
  }
}

export const eventBus = new EventBus();
