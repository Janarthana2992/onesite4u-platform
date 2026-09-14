"use client";

import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Pointer-based vertical sorting. Works with mouse and touch, shows the row
 * lifting and a line where it will land.
 */
export function useSortable<T extends { key: string }>(items: T[], onReorder: (from: number, to: number) => void) {
  const rows = useRef(new Map<string, HTMLElement>());
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const state = useRef<{ key: string; from: number; to: number } | null>(null);

  const register = useCallback((key: string, el: HTMLElement | null) => {
    if (el) rows.current.set(key, el);
    else rows.current.delete(key);
  }, []);

  const indexAt = (clientY: number) => {
    const rects = items
      .map((it) => rows.current.get(it.key))
      .filter(Boolean)
      .map((el) => (el as HTMLElement).getBoundingClientRect());
    for (let i = 0; i < rects.length; i++) {
      if (clientY < rects[i].top + rects[i].height / 2) return i;
    }
    return rects.length;
  };

  const start = useCallback(
    (key: string, from: number) => (e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragKey(key);
      state.current = { key, from, to: from };

      const move = (ev: PointerEvent) => {
        const to = indexAt(ev.clientY);
        setOverIndex(to);
        if (state.current) state.current.to = to;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        const s = state.current;
        state.current = null;
        setDragKey(null);
        setOverIndex(null);
        if (s && s.to !== s.from) onReorder(s.from, s.to > s.from ? s.to - 1 : s.to);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, onReorder],
  );

  return { register, start, dragKey, overIndex };
}

export function SortRow({
  children,
  dragging,
  showLineBefore,
  innerRef,
  className,
}: {
  children: ReactNode;
  dragging: boolean;
  showLineBefore: boolean;
  innerRef: (el: HTMLElement | null) => void;
  className?: string;
}) {
  return (
    <div className="relative">
      {showLineBefore && (
        <span className="absolute -top-1 left-0 right-0 z-10 h-0.5 rounded-full bg-brand-500 shadow-[0_0_0_3px_rgb(var(--c-500)/0.2)]" />
      )}
      <div
        ref={innerRef}
        className={cn("transition-all", dragging && "scale-[0.99] opacity-50", className)}
      >
        {children}
      </div>
    </div>
  );
}
