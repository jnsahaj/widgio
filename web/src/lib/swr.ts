import type { Thread, ThreadSummary } from "./types";

export const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = new Error(`${url} → ${res.status}`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return (await res.json()) as T;
};

export const THREADS_KEY = "/threads";

export type ThreadsPayload = { threads: ThreadSummary[] };
export type ThreadDetail = { thread: Thread; inProgress: boolean };

export function threadKey(id: string | null | undefined): string | null {
  return id ? `/threads/${encodeURIComponent(id)}` : null;
}

export async function archiveThread(id: string, archived: boolean): Promise<void> {
  await fetch(`/threads/${encodeURIComponent(id)}/archive`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ archived }),
  });
}

export async function deleteThread(id: string): Promise<void> {
  await fetch(`/threads/${encodeURIComponent(id)}`, { method: "DELETE" });
}
