"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarDays, Home, Images, Phone } from "lucide-react";
import { cn } from "@/components/ui";
import { useDesign, useScrollScope } from "@/components/design-store";
import { getDef } from "@/data/blocks";

const items = [
  { id: "home", label: "Home", icon: Home, needs: null as string | null },
  { id: "services", label: "Services", icon: Briefcase, needs: "services" as string | null },
  { id: "gallery", label: "Gallery", icon: Images, needs: "gallery" as string | null },
  { id: "contact", label: "Contact", icon: Phone, needs: "quickInfo" as string | null },
  { id: "appointment", label: "Appointment", icon: CalendarDays, needs: null as string | null, accent: true },
];

export function BottomNav({ onBook }: { onBook: () => void }) {
  const [active, setActive] = useState("home");
  const { design } = useDesign();
  const { scrollToId, scrollToTop, onScroll, viewportTop, viewportHeight } = useScrollScope();

  const navLabel = (fallback: string, needs: string | null) => {
    if (!needs) return fallback;
    const block = design.blocks.find((b) => b.type === needs && b.visible);
    const t = block?.props.title;
    const renamed = typeof t === "string" && t.trim() && t !== getDef(needs)?.defaults.title;
    return renamed ? (t as string).split(" ")[0] : fallback;
  };

  const visible = new Set(design.blocks.filter((b) => b.visible).map((b) => b.type));
  const shown = items.filter((i) => !i.needs || visible.has(i.needs));

  useEffect(() => {
    const ids = ["home", "services", "gallery", "contact"];
    return onScroll(() => {
      const marker = viewportTop() + viewportHeight() * 0.4;
      let current = "home";
      let best = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= marker && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current);
    });
  }, [onScroll, viewportTop, viewportHeight]);

  const go = (id: string) => {
    if (id === "appointment") return onBook();
    if (id === "home") return scrollToTop();
    scrollToId(id);
  };

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
      <div className="pointer-events-auto w-full max-w-md border-t border-slate-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <div
          className="grid px-1 pb-2 pt-2"
          style={{ gridTemplateColumns: `repeat(${shown.length}, minmax(0, 1fr))` }}
        >
          {shown.map(({ id, label, icon: Icon, accent, needs }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                onClick={() => go(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl py-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-brand-600 dark:text-brand-300" : "text-slate-500 dark:text-zinc-400",
                  accent && "text-brand-600 dark:text-brand-300",
                )}
              >
                {accent ? (
                  <span className="flex h-7 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-md shadow-brand-600/40">
                    <Icon size={17} />
                  </span>
                ) : (
                  <span
                    className={cn(
                      "flex h-7 w-9 items-center justify-center rounded-xl transition-colors",
                      isActive && "bg-brand-50 dark:bg-brand-500/15",
                    )}
                  >
                    <Icon size={20} />
                  </span>
                )}
                <span>{navLabel(label, needs)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
