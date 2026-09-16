"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Battery,
  Copy,
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  Monitor,
  Moon,
  Palette,
  RefreshCw,
  Settings2,
  Share2,
  Signal,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Undo2,
  Redo2,
  User,
  Wifi,
  Wifi as _W,
} from "lucide-react";
import { ProfileView } from "@/components/profile-view";
import { AdminView } from "@/components/admin-view";
import { Customizer } from "@/components/customizer";
import { BlockLibrary, EditorProvider, PropertiesPanel, useEditor } from "@/components/editor";
import { DesignScope, ScrollScopeProvider } from "@/components/design-store";
import { useContent } from "@/components/content-store";
import { ADMIN_PATH, profileLabel } from "@/lib/site";
import { useTheme, useToast } from "@/components/providers";
import { cn } from "@/components/ui";
import { useDesign } from "@/components/design-store";

void _W;

type Device = {
  id: string; name: string; w: number; h: number; radius: number; bezel: number;
  notch: "island" | "punch" | "bar" | "none"; variant: "web" | "mobile"; icon: typeof Smartphone;
};

const DEVICES: Device[] = [
  { id: "desktop", name: "Desktop", w: 1440, h: 900, radius: 14, bezel: 8, notch: "none", variant: "web", icon: Monitor },
  { id: "laptop", name: "Laptop", w: 1280, h: 800, radius: 14, bezel: 8, notch: "none", variant: "web", icon: Monitor },
  { id: "ipad", name: "iPad mini", w: 744, h: 1024, radius: 36, bezel: 12, notch: "none", variant: "mobile", icon: Tablet },
  { id: "iphone15", name: "iPhone 15", w: 393, h: 852, radius: 56, bezel: 12, notch: "island", variant: "mobile", icon: Smartphone },
  { id: "iphonese", name: "iPhone SE", w: 375, h: 667, radius: 40, bezel: 12, notch: "bar", variant: "mobile", icon: Smartphone },
  { id: "pixel", name: "Pixel 8", w: 412, h: 915, radius: 44, bezel: 12, notch: "punch", variant: "mobile", icon: Smartphone },
];

type Route = "profile" | "admin";
type LeftTab = "blocks" | "design";

export default function WebviewPage() {
  return (
    <EditorProvider enabled>
      <Studio />
    </EditorProvider>
  );
}

function Studio() {
  const { theme, toggle } = useTheme();
  const { toast } = useToast();
  const { content } = useContent();
  const { undo, redo, canUndo, canRedo, removeBlock } = useDesign();
  const editor = useEditor();
  const [deviceId, setDeviceId] = useState("desktop");
  const [route, setRoute] = useState<Route>("profile");
  const [left, setLeft] = useState<LeftTab>("blocks");
  const [mobilePanel, setMobilePanel] = useState<"canvas" | "blocks" | "edit" | "design">("canvas");
  const [scale, setScale] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const { profile } = content;
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];
  const url = route === "profile" ? profileLabel(profile.handle) : ADMIN_PATH;
  const editing = route === "profile";

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const w = stage.clientWidth - 48;
      const h = stage.clientHeight - 48;
      setScale(Math.max(0.3, Math.min(1, w / device.w, h / device.h)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [device]);

  // Jump the right panel open when something gets selected on small screens.
  useEffect(() => {
    if (editor.selectedId) setMobilePanel((p) => (p === "canvas" ? "edit" : p));
  }, [editor.selectedId]);

  // Editor keyboard shortcuts: undo/redo, delete selection, deselect.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName))) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (e.key === "Escape") {
        editor.select(null);
      } else if ((e.key === "Backspace" || e.key === "Delete") && editor.selectedId) {
        e.preventDefault();
        removeBlock(editor.selectedId);
        editor.select(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, editor, removeBlock]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
    setTimeout(() => setLoading(false), 700);
  };

  const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

  const leftPanel = (
    <>
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
        {([
          { id: "blocks", label: "Blocks", icon: LayoutGrid },
          { id: "design", label: "Design", icon: Palette },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setLeft(id)} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all", left === id ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-slate-500 dark:text-zinc-400")}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {left === "blocks" && <BlockLibrary />}
        {left === "design" && <DesignScope><Customizer hideTabs={["sections"]} /></DesignScope>}
      </div>
    </>
  );

  const rightPanel = (
    <DesignScope className="h-full">
      <PropertiesPanel onManage={() => { setRoute("admin"); toast("Admin opened in the preview", "info"); }} />
    </DesignScope>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-slate-200/70 dark:bg-black lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link href="/" aria-label="Back to profile" className={iconBtn}><ArrowLeft size={18} /></Link>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white"><Sparkles size={16} /></span>
            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">OneSite4U</p>
              <h1 className="text-sm font-bold">Page editor</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 dark:bg-zinc-800 sm:flex">
              {([{ id: "profile", label: "Profile", icon: User }, { id: "admin", label: "Admin", icon: LayoutDashboard }] as const).map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setRoute(id); editor.select(null); }} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all", route === id ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-slate-500 dark:text-zinc-400")}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-full bg-slate-100 p-0.5 dark:bg-zinc-800">
              <button onClick={undo} disabled={!canUndo} aria-label="Undo" title="Undo (⌘Z)" className={cn(iconBtn, "h-8 w-8 disabled:opacity-30")}><Undo2 size={16} /></button>
              <button onClick={redo} disabled={!canRedo} aria-label="Redo" title="Redo (⇧⌘Z)" className={cn(iconBtn, "h-8 w-8 disabled:opacity-30")}><Redo2 size={16} /></button>
            </div>
            <button onClick={toggle} aria-label="Toggle dark mode" className={iconBtn}>{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
            <Link href={route === "profile" ? "/me" : "/admin"} className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 sm:flex">
              <ExternalLink size={13} /> Preview live
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row lg:overflow-hidden">
        {/* left: library / design / packs */}
        <aside className={cn("shrink-0 border-b border-slate-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900 lg:w-[320px] lg:overflow-y-auto lg:border-b-0 lg:border-r", mobilePanel === "blocks" || mobilePanel === "design" ? "block" : "hidden lg:block")}>
          {leftPanel}
        </aside>

        {/* canvas */}
        <div className={cn("flex min-w-0 flex-1 flex-col lg:min-h-0 lg:overflow-hidden", mobilePanel === "canvas" ? "flex" : "hidden lg:flex")}>
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></div>
            <button onClick={reload} aria-label="Reload preview" className="ml-1 rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><RefreshCw size={13} className={cn(loading && "animate-spin")} /></button>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 dark:bg-zinc-800"><Lock size={11} className="shrink-0 text-emerald-500" /><span className="truncate text-xs text-slate-600 dark:text-zinc-300">{url}</span></div>
            <button onClick={() => { navigator.clipboard?.writeText(`https://${url}`).catch(() => {}); toast("Link copied"); }} aria-label="Copy link" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><Copy size={13} /></button>
            <button onClick={() => toast("Share sheet opened", "info")} aria-label="Share" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><Share2 size={13} /></button>
          </div>
          <div className="no-scrollbar mx-4 mt-2 flex gap-1.5 overflow-x-auto">
            {DEVICES.map(({ id, name, icon: Icon, w, h }) => (
              <button key={id} onClick={() => setDeviceId(id)} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all", deviceId === id ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900" : "bg-white text-slate-600 hover:bg-slate-50 dark:bg-zinc-900 dark:text-zinc-300")}>
                <Icon size={13} /> {name} <span className="opacity-60">{w}×{h}</span>
              </button>
            ))}
            <span className="ml-auto hidden shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 dark:bg-zinc-900 dark:text-zinc-400 sm:flex"><Monitor size={13} /> {Math.round(scale * 100)}%</span>
          </div>

          <div ref={stageRef} className="relative flex flex-1 items-start justify-center overflow-hidden p-6" style={{ minHeight: 420, backgroundImage: "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.3) 1px, transparent 0)", backgroundSize: "24px 24px" }} onClick={() => editor.select(null)}>
            <div style={{ width: device.w * scale, height: device.h * scale }} className="relative" onClick={(e) => e.stopPropagation()}>
              <div
                ref={screenRef}
                key={`${device.id}-${route}-${reloadKey}`}
                data-canvas-scroll="1"
                className="no-scrollbar absolute left-0 top-0 overflow-y-auto overflow-x-hidden border-slate-900 bg-white shadow-[0_30px_60px_-20px_rgb(15_23_42/0.55)] dark:border-black dark:bg-zinc-950"
                style={{ width: device.w, height: device.h, borderWidth: device.bezel, borderRadius: device.radius, transform: `scale(${scale})`, transformOrigin: "top left" }}
              >
                <ScrollScopeProvider contained scrollRef={screenRef}>
                  {route === "profile" ? (
                    <ProfileView variant={device.variant} framed={device.variant === "mobile"} />
                  ) : (
                    <EditorProvider enabled={false}>
                      <AdminView framed />
                    </EditorProvider>
                  )}
                </ScrollScopeProvider>
                {device.variant === "mobile" && (
                  <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-between bg-gradient-to-b from-black/35 to-transparent px-6 text-[13px] font-semibold text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.4)]">
                    <span>9:41</span>
                    <span className="flex items-center gap-1"><Signal size={13} /><Wifi size={13} /><Battery size={15} /></span>
                  </div>
                )}
                {device.notch === "island" && <div className="pointer-events-none fixed left-1/2 top-2 z-[61] h-7 w-28 -translate-x-1/2 rounded-full bg-black" />}
                {device.notch === "punch" && <div className="pointer-events-none fixed left-1/2 top-2.5 z-[61] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black" />}
                {device.notch === "bar" && <div className="pointer-events-none fixed left-1/2 top-0 z-[61] h-5 w-40 -translate-x-1/2 rounded-b-2xl bg-black" />}
                {loading && <div className="pointer-events-none fixed inset-x-0 top-0 z-[62] h-0.5 overflow-hidden"><span className="block h-full w-1/3 animate-[slide-right_.7s_ease-in-out_infinite] bg-indigo-500" /></div>}
              </div>
            </div>
          </div>
          {editing && (
            <p className="mx-4 mb-2 hidden text-center text-[11px] text-slate-400 lg:block">
              Click a block to edit it · drag the ⋮⋮ handle or a library item to move · empty blocks stay in the editor but are skipped live
            </p>
          )}
        </div>

        {/* right: properties */}
        <aside className={cn("shrink-0 border-t border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 lg:w-[340px] lg:overflow-y-auto lg:border-l lg:border-t-0", mobilePanel === "edit" ? "block" : "hidden lg:block")}>
          {editing ? rightPanel : (
            <div className="px-2 py-10 text-center text-sm text-slate-500 dark:text-zinc-400">
              <Settings2 size={22} className="mx-auto mb-2 text-slate-400" />
              The admin preview is not editable here. Switch back to <b>Profile</b> to edit blocks.
            </div>
          )}
        </aside>
      </div>

      {/* small-screen panel switcher */}
      <nav className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 lg:hidden">
        {([
          { id: "canvas", label: "Preview", icon: Monitor },
          { id: "blocks", label: "Blocks", icon: LayoutGrid, onClick: () => setLeft("blocks") },
          { id: "edit", label: "Edit", icon: Settings2 },
          { id: "design", label: "Design", icon: Palette, onClick: () => setLeft("design") },
        ] as const).map(({ id, label, icon: Icon, ...rest }) => (
          <button key={id} onClick={() => { setMobilePanel(id); (rest as { onClick?: () => void }).onClick?.(); }} className={cn("flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium", mobilePanel === id ? "text-indigo-600 dark:text-indigo-300" : "text-slate-500")}>
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
