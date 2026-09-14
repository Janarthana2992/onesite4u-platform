"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { BLOCK_DEFS, CATEGORIES, getDef } from "@/data/blocks";
import { blockHasContent } from "@/lib/block-content";
import { useContent } from "@/components/content-store";
import { useDesign } from "@/components/design-store";
import { useSortable, SortRow } from "@/components/sortable";
import { BlockIcon, BlockThumb } from "@/components/blocks/thumbnails";
import { Button, Card, Input, Sheet, Textarea, cn } from "@/components/ui";
import { useToast } from "@/components/providers";

type Status = "live" | "hidden" | "empty";

/** Tells the owner where the missing content is entered. */
const emptyHint = (def: { collection?: string; special?: string; label: string }) =>
  def.collection
    ? `No items yet — add them in the ${def.label} tab`
    : def.special === "profile"
      ? "Fill in your contact details on the Profile tab"
      : "Add content in this block's settings";

const STATUS: Record<Status, { label: string; dot: string; chip: string }> = {
  live: {
    label: "Live",
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  },
  hidden: {
    label: "Hidden",
    dot: "bg-slate-400",
    chip: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
  },
  empty: {
    label: "Empty",
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  },
};

/**
 * Manages the blocks on the page: reorder by dragging, rename inline, control
 * visibility, and add new ones from a visual picker.
 */
export function BlockManager({ compact = false }: { compact?: boolean }) {
  const { design, moveBlock, setBlocks, toggleBlock, removeBlock, addBlock, duplicateBlock, updateBlock } = useDesign();
  const { content } = useContent();
  const { toast } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);

  const rows = useMemo(() => design.blocks.map((b) => ({ ...b, key: b.id })), [design.blocks]);
  const sort = useSortable(rows, (from, to) => {
    const list = [...design.blocks];
    if (from < 0 || from >= list.length) return;
    const [moved] = list.splice(from, 1);
    list.splice(Math.max(0, Math.min(list.length, to)), 0, moved);
    setBlocks(list);
  });

  const statusOf = (b: (typeof design.blocks)[number]): Status =>
    !b.visible ? "hidden" : blockHasContent(b, content) ? "live" : "empty";

  const liveCount = design.blocks.filter((b) => statusOf(b) === "live").length;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold">
            <Layers size={15} className="text-brand-600 dark:text-brand-300" /> Page blocks
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            {design.blocks.length} blocks · {liveCount} live · drag to reorder
          </p>
        </div>
        <Button size="sm" onClick={() => setPicker(true)}>
          <Plus size={14} /> Add block
        </Button>
      </div>

      {design.blocks.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800">
            <Layers size={22} />
          </span>
          <div>
            <p className="text-sm font-semibold">Your page is empty</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Add a block to get started.</p>
          </div>
          <Button size="sm" onClick={() => setPicker(true)}>
            <Plus size={14} /> Add your first block
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          {design.blocks.map((b, i) => {
            const def = getDef(b.type);
            if (!def) return null;
            const status = statusOf(b);
            const meta = STATUS[status];
            const name = String(b.props.title || b.props.heading || def.label);
            const expanded = open === b.id;

            return (
              <SortRow
                key={b.id}
                dragging={sort.dragKey === b.id}
                showLineBefore={sort.overIndex === i && sort.dragKey !== null && sort.dragKey !== b.id}
                innerRef={(el) => sort.register(b.id, el)}
              >
                <div
                  className={cn(
                    "rounded-2xl border bg-white transition-all dark:bg-zinc-900",
                    expanded
                      ? "border-brand-400 shadow-md ring-1 ring-brand-500/20"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm dark:border-zinc-800 dark:hover:border-zinc-700",
                  )}
                >
                  <div className="flex items-center gap-2 p-2.5">
                    <span
                      onPointerDown={sort.start(b.id, i)}
                      style={{ touchAction: "none" }}
                      title="Drag to reorder"
                      className="flex h-9 w-6 shrink-0 cursor-grab items-center justify-center rounded-lg text-slate-300 hover:bg-slate-100 active:cursor-grabbing dark:text-zinc-600 dark:hover:bg-zinc-800"
                    >
                      <GripVertical size={15} />
                    </span>

                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        status === "live"
                          ? "bg-gradient-to-br from-brand-600 to-accent-600 text-white"
                          : "bg-slate-100 text-slate-400 dark:bg-zinc-800",
                      )}
                    >
                      <BlockIcon type={b.type} size={16} />
                    </span>

                    <button onClick={() => setOpen(expanded ? null : b.id)} className="min-w-0 flex-1 text-left">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-semibold">{name}</span>
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase", meta.chip)}>
                          {meta.label}
                        </span>
                      </span>
                      <span className="block truncate text-[11px] text-slate-500 dark:text-zinc-400">
                        {status === "empty" ? emptyHint(def) : def.label}
                      </span>
                    </button>

                    <button
                      onClick={() => toggleBlock(b.id)}
                      aria-label={b.visible ? `Hide ${name}` : `Show ${name}`}
                      title={b.visible ? "Hide" : "Show"}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800",
                        b.visible ? "text-brand-600 dark:text-brand-300" : "text-slate-400",
                      )}
                    >
                      {b.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                      onClick={() => setOpen(expanded ? null : b.id)}
                      aria-label={`Edit ${name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                    >
                      <ChevronDown size={16} className={cn("transition-transform", expanded && "rotate-180")} />
                    </button>
                  </div>

                  {expanded && (
                    <div className="space-y-3 border-t border-slate-100 p-3 dark:border-zinc-800">
                      {!def.noHeader && (
                        <div className="grid gap-2 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</span>
                            <Input
                              className="h-9 text-sm"
                              value={String(b.props.title ?? "")}
                              placeholder={String(def.defaults.title ?? def.label)}
                              onChange={(e) => updateBlock(b.id, { title: e.target.value })}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Subtitle</span>
                            <Input
                              className="h-9 text-sm"
                              value={String(b.props.subtitle ?? "")}
                              placeholder={String(def.defaults.subtitle ?? "")}
                              onChange={(e) => updateBlock(b.id, { subtitle: e.target.value })}
                            />
                          </label>
                        </div>
                      )}
                      {def.noHeader && typeof def.defaults.text === "string" && (
                        <label className="block">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Text</span>
                          <Textarea
                            rows={2}
                            className="text-sm"
                            value={String(b.props.text ?? "")}
                            onChange={(e) => updateBlock(b.id, { text: e.target.value })}
                          />
                        </label>
                      )}

                      <div className="flex flex-wrap items-center gap-1.5">
                        <Action icon={ArrowUp} label="Move up" disabled={i === 0} onClick={() => moveBlock(b.id, -1)} />
                        <Action icon={ArrowDown} label="Move down" disabled={i === design.blocks.length - 1} onClick={() => moveBlock(b.id, 1)} />
                        {def.multi && (
                          <Action
                            icon={Copy}
                            label="Duplicate"
                            onClick={() => {
                              const id = duplicateBlock(b.id);
                              if (id) {
                                setOpen(id);
                                toast(`${def.label} duplicated`);
                              }
                            }}
                          />
                        )}
                        <Link
                          href="/webview"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <PenLine size={12} /> Full options
                        </Link>
                        <Action
                          icon={Trash2}
                          label="Delete"
                          danger
                          className="ml-auto"
                          onClick={() => {
                            removeBlock(b.id);
                            setOpen(null);
                            toast(`${name} removed`, "info");
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </SortRow>
            );
          })}
        </div>
      )}

      {!compact && (
        <Link
          href="/webview"
          className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300"
        >
          <Wand2 size={13} /> Open the canvas editor for drag-and-drop on the page
        </Link>
      )}

      <BlockPicker
        open={picker}
        onClose={() => setPicker(false)}
        onAdd={(type) => {
          const id = addBlock(type);
          if (id) {
            setOpen(id);
            toast(`${getDef(type)?.label} added`);
          }
        }}
      />
    </div>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
  className,
}: {
  icon: typeof ArrowUp;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-30",
        danger
          ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200",
        className,
      )}
    >
      <Icon size={12} /> {label}
    </button>
  );
}

/** Visual picker: search, categories and thumbnails, same language as the canvas editor. */
function BlockPicker({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: string) => void;
}) {
  const { design } = useDesign();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"All" | (typeof CATEGORIES)[number]>("All");
  const onPage = new Set(design.blocks.map((b) => b.type));

  const defs = BLOCK_DEFS.filter((d) => {
    const inCat = cat === "All" || d.category === cat;
    const hit = !q.trim() || `${d.label} ${d.desc} ${d.category}`.toLowerCase().includes(q.toLowerCase());
    return inCat && hit;
  });

  return (
    <Sheet open={open} onClose={onClose} title="Add a block">
      <div className="space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${BLOCK_DEFS.length} blocks…`} className="pl-9" />
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

        <div className="grid grid-cols-2 gap-2">
          {defs.map((d) => {
            const used = !d.multi && onPage.has(d.type);
            return (
              <button
                key={d.type}
                disabled={used}
                aria-label={used ? `${d.label} already on the page` : `Add ${d.label}`}
                onClick={() => {
                  onAdd(d.type);
                  onClose();
                }}
                className={cn(
                  "group relative rounded-xl border p-1.5 text-left transition-all",
                  used
                    ? "cursor-not-allowed border-slate-100 opacity-45 dark:border-zinc-800"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900",
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

        {defs.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No blocks match “{q}”.</p>}

        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] text-slate-400">
          <Sparkles size={12} /> Empty blocks stay hidden on your live page until you add content
        </p>
      </div>
    </Sheet>
  );
}

