import { EventEmitter } from "node:events";
import type { WidgetEvent } from "../shared/types.ts";

class WidgetBus extends EventEmitter {
  private chunkSeq = new Map<string, number>();

  publish(event: WidgetEvent) {
    this.emit("event", event);
  }

  nextSeq(id: string): number {
    const n = this.chunkSeq.get(id) ?? 0;
    this.chunkSeq.set(id, n + 1);
    return n;
  }
}

export const bus = new WidgetBus();
