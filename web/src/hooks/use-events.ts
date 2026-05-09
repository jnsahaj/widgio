import { useEffect, useRef, useSyncExternalStore } from "react";
import { eventBus, type EventStatus } from "@/lib/events";
import type { WidgetEvent } from "@/lib/types";

export type { EventStatus };

/**
 * Subscribe to SSE connection status. Uses `useSyncExternalStore` — the
 * canonical React 18 primitive for reading from external stores.
 */
export function useEventStatus(): EventStatus {
  return useSyncExternalStore(
    (notify) => eventBus.subscribeStatus(notify),
    () => eventBus.getStatus(),
    () => "connecting"
  );
}

/**
 * Imperatively subscribe to widget events. The handler ref-trick keeps the
 * subscription stable even when the caller passes a fresh closure each render
 * (`advanced-event-handler-refs`).
 */
export function useLiveEvents(handler: (event: WidgetEvent) => void): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    return eventBus.subscribeEvents((event) => ref.current(event));
  }, []);
}
