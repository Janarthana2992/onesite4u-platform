"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { ContentProvider } from "@/components/content-store";
import { DesignProvider } from "@/components/design-store";

type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);

type ToastType = "success" | "info";
type Toast = { id: number; message: string; type: ToastType };
const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({
  toast: () => {},
});
export const useToast = () => useContext(ToastContext);

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("os4u-theme", next);
    } catch {}
    setTheme(next);
  }, [theme]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <DesignProvider>
        <ContentProvider>
        <ToastContext.Provider value={{ toast }}>
        {children}
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl animate-slide-down dark:bg-white dark:text-slate-900"
            >
              {t.type === "success" ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-400 dark:text-emerald-600" />
              ) : (
                <Info size={18} className="shrink-0 text-sky-400 dark:text-sky-600" />
              )}
              <span className="flex-1">{t.message}</span>
            </div>
          ))}
        </div>
        </ToastContext.Provider>
        </ContentProvider>
      </DesignProvider>
    </ThemeContext.Provider>
  );
}
