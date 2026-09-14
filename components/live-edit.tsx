"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

type Ctx = {
  /** True inside the admin live editor, where content is typed on the preview itself. */
  live: boolean;
  onPickAvatar?: () => void;
};

const LiveEditCtx = createContext<Ctx>({ live: false });

export function LiveEditProvider({ live, onPickAvatar, children }: Ctx & { children: ReactNode }) {
  const value = useMemo(() => ({ live, onPickAvatar }), [live, onPickAvatar]);
  return <LiveEditCtx.Provider value={value}>{children}</LiveEditCtx.Provider>;
}

export const useLiveEdit = () => useContext(LiveEditCtx);
