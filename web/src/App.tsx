import { useCallback, useRef } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Sidebar } from "@/components/sidebar";
import { Canvas } from "@/components/canvas";
import { useLiveEvents } from "@/hooks/use-events";
import { useThreadRoute } from "@/lib/router";
import {
  archiveThread,
  deleteThread,
  fetcher,
  THREADS_KEY,
  type ThreadsPayload,
} from "@/lib/swr";
import type { ThreadSummary } from "@/lib/types";

const EMPTY_THREADS: ThreadSummary[] = [];

export default function App() {
  const [currentId, navigate] = useThreadRoute();
  const { mutate } = useSWRConfig();

  // Stash latest currentId for non-render code paths (SSE handler, SWR
  // callbacks). Plain ref assignment during render — no effect needed.
  const currentIdRef = useRef(currentId);
  currentIdRef.current = currentId;
  const autoSelected = useRef(false);

  const { data } = useSWR<ThreadsPayload>(THREADS_KEY, fetcher, {
    revalidateOnFocus: false,
    // Auto-select newest non-archived thread on first load when path is "/".
    // Fired from SWR's success callback rather than a useEffect — the load is
    // exactly the trigger we want, and we avoid an extra effect that would
    // re-run on every threads/currentId change.
    onSuccess: (payload) => {
      if (autoSelected.current) return;
      if (currentIdRef.current !== null) return;
      if (window.location.pathname !== "/") return;
      const newest = payload.threads.find((t) => !t.archived) ?? payload.threads[0];
      if (!newest) return;
      autoSelected.current = true;
      navigate(newest.id, true);
    },
  });
  const threads = data?.threads ?? EMPTY_THREADS;

  useLiveEvents((event) => {
    switch (event.kind) {
      case "start":
      case "complete":
        mutate(THREADS_KEY);
        if (currentIdRef.current === null) navigate(event.id, true);
        break;
      case "end":
        mutate(THREADS_KEY);
        break;
      case "chunk":
        // Optimistic reorder so the live thread bubbles to the top of the
        // sidebar without a full server round-trip.
        mutate<ThreadsPayload>(
          THREADS_KEY,
          (prev) => {
            if (!prev) return prev;
            const next = prev.threads
              .map((t) =>
                t.id === event.id ? { ...t, updatedAt: Date.now(), inProgress: true } : t
              )
              .sort((a, b) => b.updatedAt - a.updatedAt);
            return { threads: next };
          },
          { revalidate: false }
        );
        break;
    }
  });

  const onArchive = useCallback(
    async (id: string, archived: boolean) => {
      // Optimistic update: flip locally, then revalidate from server.
      mutate<ThreadsPayload>(
        THREADS_KEY,
        async (prev) => {
          await archiveThread(id, archived);
          if (!prev) return prev;
          return {
            threads: prev.threads.map((t) =>
              t.id === id ? { ...t, archived, updatedAt: Date.now() } : t
            ),
          };
        },
        {
          optimisticData: (prev) =>
            prev
              ? {
                  threads: prev.threads.map((t) =>
                    t.id === id ? { ...t, archived, updatedAt: Date.now() } : t
                  ),
                }
              : { threads: [] },
          rollbackOnError: true,
        }
      );

      if (archived && currentIdRef.current === id) {
        const next = threads.find((t) => !t.archived && t.id !== id);
        navigate(next ? next.id : null);
      }
    },
    [mutate, navigate, threads]
  );

  const onDelete = useCallback(
    async (id: string) => {
      mutate<ThreadsPayload>(
        THREADS_KEY,
        async (prev) => {
          await deleteThread(id);
          if (!prev) return prev;
          return { threads: prev.threads.filter((t) => t.id !== id) };
        },
        {
          optimisticData: (prev) =>
            prev ? { threads: prev.threads.filter((t) => t.id !== id) } : { threads: [] },
          rollbackOnError: true,
        }
      );

      if (currentIdRef.current === id) {
        const next = threads.find((t) => !t.archived && t.id !== id) ?? threads.find((t) => t.id !== id);
        navigate(next ? next.id : null);
      }
    },
    [mutate, navigate, threads]
  );

  return (
    <div className="grid h-full grid-cols-[260px_1fr] max-md:grid-cols-1 max-md:grid-rows-[240px_1fr]">
      <Sidebar
        threads={threads}
        currentId={currentId}
        onSelect={navigate}
        onArchive={onArchive}
        onDelete={onDelete}
      />
      <Canvas threadId={currentId} />
    </div>
  );
}
