"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScrollScope } from "@/components/design-store";
import { cn } from "@/lib/cn";

/**
 * Fades a section up as it scrolls into view.
 *
 * Anything already on screen renders immediately — only content below the fold
 * animates — and a short fallback reveals everything if the observer never
 * fires (print, screenshots, older browsers). Content must never depend on an
 * animation to become readable.
 */
export function Reveal({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);
  const { getEl } = useScrollScope();

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const scroller = getEl();
    const viewportBottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;

    // Already visible (or no observer support): show it straight away.
    if (typeof IntersectionObserver === "undefined" || el.getBoundingClientRect().top < viewportBottom) {
      setShown(true);
      return;
    }

    setArmed(true);
    const fallback = setTimeout(() => setShown(true), 900);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
        clearTimeout(fallback);
      },
      { root: scroller, rootMargin: "0px 0px -6% 0px", threshold: 0.02 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [disabled, getEl]);

  if (disabled) return <>{children}</>;

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        armed && !shown ? "translate-y-5 opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      {children}
    </div>
  );
}
