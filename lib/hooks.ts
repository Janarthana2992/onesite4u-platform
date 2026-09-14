"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

export type SubmitStatus = "idle" | "loading" | "success";

/** Simulates a network submission: loading → success, no backend. */
export function useFakeSubmit(delay = 1200) {
  const [status, setStatus] = useState<SubmitStatus>("idle");

  const submit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      setStatus("loading");
      await new Promise((r) => setTimeout(r, delay));
      setStatus("success");
    },
    [delay],
  );

  const reset = useCallback(() => setStatus("idle"), []);

  return { status, submit, reset, loading: status === "loading", success: status === "success" };
}

/** Viewport media query. Returns false on the server and on first paint. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
