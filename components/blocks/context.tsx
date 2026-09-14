"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Block } from "@/data/blocks";

type Ctx = {
  block: Block | null;
  wide: boolean;
  /** True when this block is selected in the editor, so text is typed in place. */
  editing: boolean;
  setProp: (key: string, value: unknown) => void;
};

const BlockCtx = createContext<Ctx>({ block: null, wide: false, editing: false, setProp: () => {} });

export function BlockProvider({ block, wide, editing, setProp, children }: Ctx & { children: ReactNode }) {
  const value = useMemo(() => ({ block, wide, editing, setProp }), [block, wide, editing, setProp]);
  return <BlockCtx.Provider value={value}>{children}</BlockCtx.Provider>;
}

export const useBlock = () => useContext(BlockCtx);

/** Used by shared UI (headings, text) to switch into in-place editing. */
export function useBlockEditing() {
  const { editing, setProp } = useContext(BlockCtx);
  return { editing, setProp };
}

/** Typed access to the current block's props with a fallback. */
export function useProp<T>(key: string, fallback: T): T {
  const { block } = useBlock();
  const v = block?.props?.[key];
  return (v === undefined || v === null ? fallback : (v as T)) as T;
}

/**
 * Heading for the current block: whatever the owner typed in the block's
 * settings, else the wording the block ships with.
 */
export function useSectionLabel(_type: string, title: string, subtitle: string) {
  const { block } = useBlock();
  const t = block?.props?.title;
  const s = block?.props?.subtitle;
  return {
    title: typeof t === "string" && t.trim() ? t : title,
    subtitle: typeof s === "string" ? (s.trim() ? s : "") : subtitle,
  };
}
