import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

/** Compact form for sidebar timestamps: "5m", "2h", "3d", "Mar 14". */
export function relativeTimeShort(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  if (d < 30) return `${Math.floor(d / 7)}w`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type DateBucket = "Today" | "Yesterday" | "This week" | "This month" | "Older";

/**
 * Bucket a timestamp into a coarse date group for sidebar grouping.
 * Today = local-day match; Yesterday = previous local day; etc.
 */
export function dateBucket(ts: number): DateBucket {
  const now = new Date();
  const then = new Date(ts);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfThen) / (24 * 60 * 60 * 1000));
  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return "This week";
  if (dayDiff < 30) return "This month";
  return "Older";
}

const BUCKET_ORDER: DateBucket[] = ["Today", "Yesterday", "This week", "This month", "Older"];

export function groupByDate<T extends { updatedAt: number }>(items: T[]): { label: DateBucket; items: T[] }[] {
  const map = new Map<DateBucket, T[]>();
  for (const item of items) {
    const b = dateBucket(item.updatedAt);
    if (!map.has(b)) map.set(b, []);
    map.get(b)!.push(item);
  }
  return BUCKET_ORDER.filter((b) => map.has(b)).map((label) => ({ label, items: map.get(label)! }));
}
