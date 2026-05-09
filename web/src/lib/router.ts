import { useCallback, useEffect, useState } from "react";

const THREAD_PATH = /^\/t\/([^/]+)\/?$/;

export function parseThreadId(pathname: string): string | null {
  const m = pathname.match(THREAD_PATH);
  return m ? decodeURIComponent(m[1]) : null;
}

export function threadHref(id: string): string {
  return `/t/${encodeURIComponent(id)}`;
}

/**
 * Tiny path-based router. Returns the current thread id parsed from the URL,
 * plus a `navigate` fn that pushes a new history entry.
 *
 * Why hand-rolled: URL space is just `/` and `/t/:id`, so pulling in
 * react-router would be overkill. Listens to `popstate` for back/forward.
 */
export function useThreadRoute(): [string | null, (id: string | null, replace?: boolean) => void] {
  const [id, setId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : parseThreadId(window.location.pathname)
  );

  useEffect(() => {
    const sync = () => setId(parseThreadId(window.location.pathname));
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // Stable identity so consumers can use `navigate` in effect deps without
  // re-running the effect on every render (`rerender-functional-setstate`).
  const navigate = useCallback((next: string | null, replace = false) => {
    const url = next ? threadHref(next) : "/";
    if (window.location.pathname === url) return;
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
    setId(next);
  }, []);

  return [id, navigate];
}
