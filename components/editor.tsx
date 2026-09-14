"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  MousePointerClick,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { BLOCK_DEFS, CATEGORIES, getDef, type Block, type Field } from "@/data/blocks";
import { BlockIcon, BlockThumb } from "@/components/blocks/thumbnails";
import { useDesign } from "@/components/design-store";
import { useContent } from "@/components/content-store";
import { Button, Field as FormField, Input, Switch, Textarea, cn } from "@/components/ui";
import { useToast } from "@/components/providers";

/* ======================= Editor state ======================= */

export type DragSource = { kind: "new"; type: string } | { kind: "move"; id: string };

type DragState = {
  source: DragSource;
  label: string;
  /** Pointer position in client coordinates. */
  x: number;
  y: number;
  dropIndex: number;
  /** True once the pointer has moved far enough to count as a drag, not a tap. */
  active: boolean;
};

type EditorCtx = {
  enabled: boolean;
  selectedId: string | null;
  select: (id: string | null) => void;
  drag: DragState | null;
  /** Begins a pointer drag from a library tile or a block on the canvas. */
  startDrag: (source: DragSource, label: string, e: ReactPointerEvent, onTap?: () => void) => void;
  /** True immediately after a drag, so a trailing click does not double-fire. */
  justDragged: () => boolean;
  registerBlock: (id: string, el: HTMLElement | null) => void;
};

const Ctx = createContext<EditorCtx>({
  enabled: false,
  selectedId: null,
  select: () => {},
  drag: null,
  startDrag: () => {},
  justDragged: () => false,
  registerBlock: () => {},
});

export const useEditor = () => useContext(Ctx);

const DRAG_THRESHOLD = 5;
const EDGE = 64;

export function EditorProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [selectedId, select] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const blockEls = useRef(new Map<string, HTMLElement>());
  const scrollTimer = useRef<number | null>(null);
  const draggedAt = useRef(0);
  const { addBlock, reorderBlock } = useDesign();
  const { toast } = useToast();

  const registerBlock = useCallback((id: string, el: HTMLElement | null) => {
    if (el) blockEls.current.set(id, el);
    else blockEls.current.delete(id);
  }, []);

  /** Blocks in visual order, so the drop index matches the page order. */
  const orderedRects = () =>
    Array.from(blockEls.current.values())
      .map((el) => el.getBoundingClientRect())
      .sort((a, b) => a.top - b.top);

  const dropIndexFor = (clientY: number) => {
    const rects = orderedRects();
    for (let i = 0; i < rects.length; i++) {
      if (clientY < rects[i].top + rects[i].height / 2) return i;
    }
    return rects.length;
  };

  const stopAutoScroll = () => {
    if (scrollTimer.current !== null) {
      cancelAnimationFrame(scrollTimer.current);
      scrollTimer.current = null;
    }
  };

  /** Scrolls the canvas when the pointer nears its top or bottom edge. */
  const autoScroll = (clientY: number) => {
    const scroller = document.querySelector<HTMLElement>("[data-canvas-scroll]");
    if (!scroller) return;
    const r = scroller.getBoundingClientRect();
    let dy = 0;
    if (clientY < r.top + EDGE) dy = -Math.ceil((r.top + EDGE - clientY) / 5);
    else if (clientY > r.bottom - EDGE) dy = Math.ceil((clientY - (r.bottom - EDGE)) / 5);
    stopAutoScroll();
    if (dy === 0) return;
    const step = () => {
      scroller.scrollTop += dy;
      const d = dragRef.current;
      if (d) {
        const next = { ...d, dropIndex: dropIndexFor(d.y) };
        dragRef.current = next;
        setDrag(next);
      }
      scrollTimer.current = requestAnimationFrame(step);
    };
    scrollTimer.current = requestAnimationFrame(step);
  };

  const startDrag = useCallback(
    (source: DragSource, label: string, e: ReactPointerEvent, onTap?: () => void) => {
      if (!enabled || e.button === 2) return;
      e.preventDefault();
      const originX = e.clientX;
      const originY = e.clientY;

      const begin: DragState = { source, label, x: originX, y: originY, dropIndex: 0, active: false };
      dragRef.current = begin;
      setDrag(begin);

      const move = (ev: PointerEvent) => {
        const d = dragRef.current;
        if (!d) return;
        const far = Math.hypot(ev.clientX - originX, ev.clientY - originY) > DRAG_THRESHOLD;
        const active = d.active || far;
        const next: DragState = {
          ...d,
          x: ev.clientX,
          y: ev.clientY,
          active,
          dropIndex: active ? dropIndexFor(ev.clientY) : d.dropIndex,
        };
        dragRef.current = next;
        setDrag(next);
        if (active) autoScroll(ev.clientY);
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        stopAutoScroll();
        const d = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (!d) return;
        if (!d.active) {
          onTap?.();
          return;
        }
        draggedAt.current = Date.now();
        if (d.source.kind === "new") {
          const id = addBlock(d.source.type, d.dropIndex);
          if (id) {
            select(id);
            toast(`${d.label} added`);
          }
        } else {
          reorderBlock(d.source.id, d.dropIndex);
        }
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [enabled, addBlock, reorderBlock, toast],
  );

  useEffect(() => stopAutoScroll, []);

  const justDragged = useCallback(() => Date.now() - draggedAt.current < 250, []);

  const value = useMemo(
    () => ({ enabled, selectedId, select, drag, startDrag, justDragged, registerBlock }),
    [enabled, selectedId, drag, startDrag, justDragged, registerBlock],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {drag?.active && <DragGhost drag={drag} />}
    </Ctx.Provider>
  );
}

/** The card that follows the cursor while dragging. */
function DragGhost({ drag }: { drag: DragState }) {
  const type = drag.source.kind === "new" ? drag.source.type : undefined;
  return (
    <div
      className="pointer-events-none fixed z-[200] -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ left: drag.x, top: drag.y }}
    >
      <div className="flex w-40 -rotate-3 flex-col gap-1.5 rounded-xl border border-brand-300 bg-white p-2 shadow-2xl dark:border-brand-500/50 dark:bg-zinc-900">
        {type && <BlockThumb type={type} className="h-9" />}
        <span className="flex items-center gap-1.5 px-0.5 text-[11px] font-semibold">
          <GripVertical size={12} className="text-slate-400" />
          <span className="truncate">{drag.label}</span>
        </span>
      </div>
    </div>
  );
}

/** The line that shows where the block will land. */
export function DropIndicator({ index }: { index: number }) {
  const { drag } = useEditor();
  if (!drag?.active || drag.dropIndex !== index) return null;
  return (
    <div className="relative -my-2 h-4">
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-brand-500 shadow-[0_0_0_4px_rgb(var(--c-500)/0.2)]" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
        Drop here
      </span>
    </div>
  );
}

/** Wraps one block on the canvas with selection, hover toolbar and drag handle. */
export function BlockFrame({
  block,
  index,
  total,
  empty,
  children,
}: {
  block: Block;
  index: number;
  total: number;
  empty: boolean;
  children: ReactNode;
}) {
  const editor = useEditor();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    editor.registerBlock(block.id, ref.current);
    return () => editor.registerBlock(block.id, null);
  }, [block.id, editor]);
  const { moveBlock, duplicateBlock, removeBlock, toggleBlock } = useDesign();
  const { toast } = useToast();
  const def = getDef(block.type);
  const selected = editor.selectedId === block.id;
  const isDragging =
    editor.drag?.active && editor.drag.source.kind === "move" && editor.drag.source.id === block.id;
  const title = (block.props.title as string) || (block.props.heading as string) || def?.label || block.type;

  return (
    <div
      ref={ref}
      className={cn(
        "group/frame relative rounded-2xl transition-all",
        selected ? "ring-2 ring-brand-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-zinc-950" : "hover:ring-2 hover:ring-brand-400/60 hover:ring-offset-2 hover:ring-offset-slate-50 dark:hover:ring-offset-zinc-950",
        isDragging && "opacity-40",
        (!block.visible || empty) && "opacity-70",
      )}
      onClick={(e) => {
        e.stopPropagation();
        editor.select(block.id);
      }}
    >
      {/* Click-to-select shield: the block is only interactive once selected. */}
      {!selected && (
        <div
          className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
          aria-hidden
          onPointerDown={(e) => editor.startDrag({ kind: "move", id: block.id }, title, e, () => editor.select(block.id))}
          style={{ touchAction: "none" }}
        />
      )}

      {/* label doubles as the drag handle */}
      <div
        className={cn(
          "absolute -top-3 left-3 z-20 flex items-center gap-1 transition-opacity",
          selected ? "opacity-100" : "opacity-0 group-hover/frame:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          onPointerDown={(e) => {
            e.stopPropagation();
            editor.startDrag({ kind: "move", id: block.id }, title, e, () => editor.select(block.id));
          }}
          style={{ touchAction: "none" }}
          title="Drag to move"
          className="flex cursor-grab items-center gap-1 rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow active:cursor-grabbing"
        >
          <GripVertical size={10} /> {def?.label ?? block.type}
        </span>
        {!block.visible && (
          <span className="rounded-md bg-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-white">Hidden</span>
        )}
        {empty && block.visible && (
          <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            Empty · not shown live
          </span>
        )}
      </div>

      {/* toolbar */}
      <div
        className={cn(
          "absolute -top-4 right-3 z-30 flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-lg transition-opacity dark:border-zinc-700 dark:bg-zinc-900",
          selected ? "opacity-100" : "opacity-0 group-hover/frame:opacity-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          onPointerDown={(e) => {
            e.stopPropagation();
            editor.startDrag({ kind: "move", id: block.id }, title, e);
          }}
          style={{ touchAction: "none" }}
          title="Drag to move"
          className="flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 active:cursor-grabbing dark:hover:bg-zinc-800"
        >
          <GripVertical size={14} />
        </span>
        <ToolBtn label="Move up" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}>
          <ArrowUp size={14} />
        </ToolBtn>
        <ToolBtn label="Move down" disabled={index === total - 1} onClick={() => moveBlock(block.id, 1)}>
          <ArrowDown size={14} />
        </ToolBtn>
        {def?.multi && (
          <ToolBtn
            label="Duplicate"
            onClick={() => {
              const id = duplicateBlock(block.id);
              if (id) editor.select(id);
            }}
          >
            <Copy size={14} />
          </ToolBtn>
        )}
        <ToolBtn label={block.visible ? "Hide" : "Show"} onClick={() => toggleBlock(block.id)}>
          {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </ToolBtn>
        <ToolBtn
          label="Delete"
          danger
          onClick={() => {
            removeBlock(block.id);
            if (selected) editor.select(null);
            toast(`${title} removed`, "info");
          }}
        >
          <Trash2 size={14} />
        </ToolBtn>
      </div>

      {children}
    </div>
  );
}

function ToolBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors disabled:opacity-30",
        danger ? "hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" : "hover:bg-slate-100 dark:hover:bg-zinc-800",
      )}
    >
      {children}
    </button>
  );
}

/* ======================= Block library ======================= */

export function BlockLibrary() {
  const { design, addBlock } = useDesign();
  const editor = useEditor();
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | (typeof CATEGORIES)[number]>("All");
  const onPage = new Set(design.blocks.map((b) => b.type));

  const defs = BLOCK_DEFS.filter((d) => {
    const inCat = cat === "All" || d.category === cat;
    const hit = !q.trim() || `${d.label} ${d.desc} ${d.category}`.toLowerCase().includes(q.toLowerCase());
    return inCat && hit;
  });

  const groups = cat === "All" ? CATEGORIES : [cat];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 41 blocks…" className="h-10 pl-9 text-sm" />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
              cat === c
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
        Drag a tile onto the page, or tap it to add at the end.
      </p>

      {groups.map((group) => {
        const list = defs.filter((d) => d.category === group);
        if (list.length === 0) return null;
        return (
          <div key={group}>
            {cat === "All" && (
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {list.map((d) => {
                const used = !d.multi && onPage.has(d.type);
                return (
                  <button
                    key={d.type}
                    type="button"
                    disabled={used}
                    aria-label={used ? `${d.label} already on the page` : `Add ${d.label}`}
                    title={d.desc}
                    style={{ touchAction: "none" }}
                    onPointerDown={(e) => {
                      if (used) return;
                      editor.startDrag({ kind: "new", type: d.type }, d.label, e);
                    }}
                    onClick={() => {
                      if (used || editor.justDragged()) return;
                      const id = addBlock(d.type);
                      editor.select(id);
                      toast(`${d.label} added to the end`);
                    }}
                    className={cn(
                      "group relative rounded-xl border p-1.5 text-left transition-all",
                      used
                        ? "cursor-not-allowed border-slate-100 opacity-45 dark:border-zinc-800"
                        : "cursor-grab border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-900",
                    )}
                  >
                    <BlockThumb type={d.type} />
                    <span className="mt-1.5 flex items-center gap-1 px-0.5">
                      <span className="text-brand-600 dark:text-brand-300"><BlockIcon type={d.type} size={12} /></span>
                      <span className="truncate text-[11px] font-semibold">{d.label}</span>
                    </span>
                    {used ? (
                      <span className="absolute right-2 top-2 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Added
                      </span>
                    ) : (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md bg-brand-600 text-white opacity-0 shadow transition-opacity group-hover:opacity-100">
                        <Plus size={12} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {defs.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">No blocks match “{q}”.</p>
      )}
    </div>
  );
}

/* ======================= Properties panel ======================= */

export function PropertiesPanel({ onManage }: { onManage?: (collection: string) => void }) {
  const editor = useEditor();
  const { design, updateBlock, removeBlock, toggleBlock } = useDesign();
  const { content } = useContent();
  const block = design.blocks.find((b) => b.id === editor.selectedId) ?? null;

  if (!block) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800">
          <MousePointerClick size={22} />
        </span>
        <p className="mt-3 text-sm font-semibold">Select a block to edit it</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Click any block on the page. Headings can be typed straight on the page; items and options appear here.
        </p>
        <ul className="mt-5 space-y-1.5 text-left text-[11px] text-slate-500 dark:text-zinc-400">
          {[
            ["Drag", "a tile from the left onto the page"],
            ["Click", "a heading on the page to retype it"],
            ["⌘Z", "undo, ⇧⌘Z redo"],
            ["Delete", "removes the selected block"],
          ].map(([k, v]) => (
            <li key={k} className="flex items-center gap-2">
              <kbd className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{k}</kbd>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const def = getDef(block.type);
  if (!def) return null;
  const set = (patch: Record<string, unknown>) => updateBlock(block.id, patch);

  const collectionCount = def.collection ? ((content as Record<string, unknown>)[def.collection] as unknown[]).length : null;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white">
            <BlockIcon type={block.type} size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{def.category}</p>
            <h3 className="truncate text-base font-bold">{def.label}</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{def.desc}</p>
          </div>
        </div>
        <button onClick={() => editor.select(null)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800">
          <X size={16} />
        </button>
      </div>

      {!def.noHeader && (
        <Section title="Heading">
          <FormField label="Title" hint="You can also type this directly on the page">
            <Input value={String(block.props.title ?? "")} onChange={(e) => set({ title: e.target.value })} placeholder={String(def.defaults.title ?? "")} />
          </FormField>
          <FormField label="Subtitle">
            <Input value={String(block.props.subtitle ?? "")} onChange={(e) => set({ subtitle: e.target.value })} />
          </FormField>
        </Section>
      )}

      {def.fields.length > 0 && (
        <Section title={def.noHeader ? "Content" : "Options"}>
          {def.fields.map((f) => (
            <FieldEditor key={f.key} field={f} value={block.props[f.key]} onChange={(v) => set({ [f.key]: v })} />
          ))}
        </Section>
      )}

      {def.collection && (
        <Section title="Items">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/60">
            <div>
              <p className="text-sm font-semibold">{collectionCount} item{collectionCount === 1 ? "" : "s"}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Shared with the admin dashboard</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => onManage?.(def.collection!)}>
              <Settings2 size={13} /> Manage
            </Button>
          </div>
        </Section>
      )}

      {def.special === "profile" && (
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          Phone, email, website and address come from your profile. Edit them in the admin dashboard&apos;s Profile tab.
        </p>
      )}
      {(def.special === "grievance" || def.special === "assistant") && (
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          Categories, knowledge and behaviour are managed in the admin dashboard&apos;s {def.special === "grievance" ? "Requests" : "AI Assistant"} tab.
        </p>
      )}

      <div className="flex gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
        <Button variant="outline" full onClick={() => toggleBlock(block.id)}>
          {block.visible ? <><EyeOff size={15} /> Hide</> : <><Eye size={15} /> Show</>}
        </Button>
        <Button
          variant="danger"
          full
          onClick={() => {
            removeBlock(block.id);
            editor.select(null);
          }}
        >
          <Trash2 size={15} /> Delete
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

/* ======================= Field editors ======================= */

export function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.type === "toggle") {
    return (
      <div className="flex items-center justify-between py-1">
        <p className="text-sm font-medium">{field.label}</p>
        <Switch checked={Boolean(value)} onChange={onChange} label={field.label} />
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <FormField label={field.label}>
        <select
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </FormField>
    );
  }
  if (field.type === "textarea") {
    return (
      <FormField label={field.label} hint={field.hint}>
        <Textarea rows={4} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      </FormField>
    );
  }
  if (field.type === "items") {
    return <ItemsEditor field={field} value={(value as Record<string, unknown>[]) ?? []} onChange={onChange} />;
  }
  return (
    <FormField label={field.label} hint={field.hint}>
      <Input
        type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
        value={String(value ?? "")}
        onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) || 0 : e.target.value)}
        placeholder={field.placeholder}
      />
    </FormField>
  );
}

/** Repeatable rows for list-type props (FAQ entries, plans, team members…). */
function ItemsEditor({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: "items" }>;
  value: Record<string, unknown>[];
  onChange: (v: unknown) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const update = (i: number, patch: Record<string, unknown>) =>
    onChange(value.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const list = [...value];
    [list[i], list[j]] = [list[j], list[i]];
    onChange(list);
  };
  const add = () => {
    const blank = Object.fromEntries(field.fields.map((f) => [f.key, f.type === "toggle" ? false : f.type === "number" ? 0 : ""]));
    onChange([...value, blank]);
    setOpen(value.length);
  };
  const primary = (row: Record<string, unknown>) => {
    const first = field.fields.find((f) => f.type === "text" || f.type === "select");
    return String(row[first?.key ?? ""] ?? "") || `Untitled ${field.itemLabel}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{field.label}</p>
        <span className="text-[11px] text-slate-400">{value.length}{field.max ? ` / ${field.max}` : ""}</span>
      </div>
      {value.map((row, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-1 p-1.5">
            <button onClick={() => setOpen(open === i ? null : i)} className="min-w-0 flex-1 truncate px-1.5 text-left text-sm font-medium">
              {primary(row)}
            </button>
            <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-zinc-800"><ArrowUp size={13} /></button>
            <button onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down" className="rounded-md p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-25 dark:hover:bg-zinc-800"><ArrowDown size={13} /></button>
            <button onClick={() => remove(i)} aria-label="Remove" className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"><Trash2 size={13} /></button>
          </div>
          {open === i && (
            <div className="space-y-2.5 border-t border-slate-100 p-2.5 dark:border-zinc-800">
              {field.fields.map((f) => (
                <FieldEditor key={f.key} field={f} value={row[f.key]} onChange={(v) => update(i, { [f.key]: v })} />
              ))}
            </div>
          )}
        </div>
      ))}
      <Button size="sm" variant="outline" full onClick={add} disabled={field.max !== undefined && value.length >= field.max}>
        <Plus size={13} /> Add {field.itemLabel}
      </Button>
    </div>
  );
}
