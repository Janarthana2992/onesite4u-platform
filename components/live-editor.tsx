"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  LayoutTemplate,
  Maximize2,
  Monitor,
  Palette,
  Plus,
  Smartphone,
  Trash2,
  Type,
  User,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PROFILE_FIELDS, AVATAR_PRESETS, profileFieldDef } from "@/data/profile-fields";
import { PALETTES, FONTS } from "@/data/design";
import { getDef } from "@/data/blocks";
import { useContent } from "@/components/content-store";
import { useDesign } from "@/components/design-store";
import { useSortable, SortRow } from "@/components/sortable";
import { ProfileView } from "@/components/profile-view";
import { EditorProvider } from "@/components/editor";
import { LiveEditProvider } from "@/components/live-edit";
import { ScrollScopeProvider } from "@/components/design-store";
import { BlockIcon } from "@/components/blocks/thumbnails";
import { Button, Card, Field, Input, Sheet, Switch, Textarea, cn } from "@/components/ui";
import { useToast } from "@/components/providers";

type Pane = "layout" | "fields" | "preview";

/**
 * Three panes: the page outline on the left, the selected section's fields in
 * the middle, and a live preview on the right that is itself editable.
 */
export function LiveEditor() {
  const { content, updateProfile, toggleProfileField, moveProfileField, removeProfileField, addProfileField } =
    useContent();
  const { design, update, toggleBlock, setBlocks, removeBlock, addBlock, updateBlock } = useDesign();
  const { toast } = useToast();

  const [selected, setSelected] = useState<string>("profile");
  const [device, setDevice] = useState<"desktop" | "mobile">("mobile");
  const [zoom, setZoom] = useState(0.9);
  const [fit, setFit] = useState(true);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [pane, setPane] = useState<Pane>("preview");
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);

  const size = device === "desktop" ? { w: 1280, h: 900 } : { w: 393, h: 852 };

  useEffect(() => {
    if (!fit) return;
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const available = stage.clientWidth - 40;
      setZoom(Math.max(0.25, Math.min(1, available / size.w)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [fit, size.w]);

  /* ---------- left: page outline ---------- */

  const outline = useMemo(
    () => [{ key: "profile" }, ...design.blocks.map((b) => ({ key: b.id }))],
    [design.blocks],
  );
  const sort = useSortable(outline, (from, to) => {
    // index 0 is the profile header, which always stays first
    if (from === 0) return;
    const list = [...design.blocks];
    const [moved] = list.splice(from - 1, 1);
    list.splice(Math.max(0, Math.min(list.length, to - 1)), 0, moved);
    setBlocks(list);
  });

  const selectedBlock = design.blocks.find((b) => b.id === selected) ?? null;

  const layoutPane = (
    <div className="space-y-4">
      <Panel icon={LayoutTemplate} title="Layout">
        <div className="space-y-1.5">
          <button
            onClick={() => setSelected("profile")}
            className={cn(
              "flex w-full items-center gap-2 rounded-xl border p-2.5 text-left transition-colors",
              selected === "profile"
                ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10"
                : "border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60",
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <User size={15} />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">Profile header</span>
          </button>

          {design.blocks.map((b, i) => {
            const def = getDef(b.type);
            const name = String(b.props.title || b.props.heading || def?.label || b.type);
            return (
              <SortRow
                key={b.id}
                dragging={sort.dragKey === b.id}
                showLineBefore={sort.overIndex === i + 1 && sort.dragKey !== null && sort.dragKey !== b.id}
                innerRef={(el) => sort.register(b.id, el)}
              >
                <div
                  onClick={() => setSelected(b.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-xl border p-2 transition-colors",
                    selected === b.id
                      ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60",
                    !b.visible && "opacity-55",
                  )}
                >
                  <span
                    onPointerDown={sort.start(b.id, i + 1)}
                    style={{ touchAction: "none" }}
                    className="cursor-grab text-slate-300 active:cursor-grabbing dark:text-zinc-600"
                  >
                    <GripVertical size={14} />
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <BlockIcon type={b.type} size={13} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBlock(b.id); }}
                    aria-label={b.visible ? `Hide ${name}` : `Show ${name}`}
                    className={cn("rounded-md p-1", b.visible ? "text-brand-600" : "text-slate-400")}
                  >
                    {b.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeBlock(b.id); if (selected === b.id) setSelected("profile"); }}
                    aria-label={`Delete ${name}`}
                    className="rounded-md p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </SortRow>
            );
          })}
        </div>
        <Button
          full
          variant="dark"
          className="mt-3"
          onClick={() => {
            const id = addBlock("text");
            setSelected(id);
            toast("Text block added");
          }}
        >
          <Plus size={15} /> Add custom section
        </Button>
      </Panel>

      <Panel icon={Palette} title="Theme colour">
        <div className="rounded-xl bg-slate-900 p-3 text-white dark:bg-zinc-800">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="opacity-70">Current</span>
            <span className="font-mono">{PALETTES.find((p) => p.id === design.paletteId)?.hex}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-9 w-9 shrink-0 rounded-lg ring-2 ring-white/20"
              style={{ backgroundColor: PALETTES.find((p) => p.id === design.paletteId)?.hex }}
            />
            <span className="min-w-0 flex-1 truncate rounded-lg bg-white/10 px-2.5 py-2 font-mono text-xs">
              {PALETTES.find((p) => p.id === design.paletteId)?.name}
            </span>
          </div>
        </div>
        <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Presets</p>
        <div className="grid grid-cols-6 gap-1.5">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              onClick={() => update({ paletteId: p.id })}
              aria-label={p.name}
              title={p.name}
              className={cn(
                "aspect-square rounded-lg transition-transform active:scale-90",
                design.paletteId === p.id && "ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900",
              )}
              style={{ backgroundColor: p.hex }}
            />
          ))}
        </div>
      </Panel>

      <Panel icon={Type} title="Typography">
        <Field label="Font pairing">
          <select
            value={design.fontId}
            onChange={(e) => update({ fontId: e.target.value })}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
          >
            {FONTS.map((f) => (
              <option key={f.id} value={f.id}>{f.name} · {f.note}</option>
            ))}
          </select>
        </Field>
        <Slider
          label="Line height"
          value={design.lineHeight}
          min={1.2}
          max={2}
          step={0.05}
          onChange={(v) => update({ lineHeight: v })}
          format={(v) => v.toFixed(2)}
        />
        <Slider
          label="Base font size"
          value={design.baseFontSize}
          min={13}
          max={20}
          step={1}
          onChange={(v) => update({ baseFontSize: v })}
          format={(v) => `${v}px`}
        />
      </Panel>
    </div>
  );

  /* ---------- middle: fields for the selection ---------- */

  const fieldsPane =
    selected === "profile" ? (
      <ProfileFieldsPane
        onPickAvatar={() => setAvatarOpen(true)}
        onToggle={toggleProfileField}
        onMove={moveProfileField}
        onRemove={removeProfileField}
        onAdd={addProfileField}
      />
    ) : selectedBlock ? (
      <BlockFieldsPane block={selectedBlock} onChange={(patch) => updateBlock(selectedBlock.id, patch)} />
    ) : (
      <p className="py-10 text-center text-sm text-slate-400">Pick a section on the left.</p>
    );

  /* ---------- right: live preview ---------- */

  const preview = (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 px-3 py-2 dark:border-zinc-800">
        <button onClick={() => { setFit(false); setZoom((z) => Math.max(0.25, z - 0.1)); }} aria-label="Zoom out" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><ZoomOut size={15} /></button>
        <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
        <button onClick={() => { setFit(false); setZoom((z) => Math.min(1, z + 0.1)); }} aria-label="Zoom in" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"><ZoomIn size={15} /></button>
        <button onClick={() => setFit(true)} className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold", fit ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800")}>
          <Maximize2 size={12} /> Fit width
        </button>
        <div className="ml-auto flex items-center gap-1 rounded-full bg-slate-100 p-0.5 dark:bg-zinc-800">
          {([["desktop", Monitor], ["mobile", Smartphone]] as const).map(([id, Icon]) => (
            <button key={id} onClick={() => setDevice(id)} aria-label={id} className={cn("rounded-full p-1.5", device === id ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-slate-500")}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      <div ref={stageRef} className="flex-1 overflow-hidden bg-slate-100 p-5 dark:bg-black">
        <div style={{ width: size.w * zoom, height: size.h * zoom }} className="mx-auto">
          <div
            ref={screenRef}
            data-canvas-scroll="1"
            className="no-scrollbar overflow-y-auto overflow-x-hidden rounded-2xl border-4 border-slate-900 bg-white shadow-2xl dark:border-black dark:bg-zinc-950"
            style={{ width: size.w, height: size.h, transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <ScrollScopeProvider contained scrollRef={screenRef}>
              <LiveEditProvider live onPickAvatar={() => setAvatarOpen(true)}>
                <ProfileView variant={device === "desktop" ? "web" : "mobile"} framed={device === "mobile"} />
              </LiveEditProvider>
            </ScrollScopeProvider>
          </div>
        </div>
      </div>
      <p className="border-t border-slate-200 px-3 py-1.5 text-center text-[11px] text-slate-400 dark:border-zinc-800">
        Click any heading, name or tagline in the preview to retype it · click the avatar to change the photo
      </p>
    </div>
  );

  return (
    <EditorProvider enabled={false}>
      {/* mobile pane switcher */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800 xl:hidden">
        {([["layout", "Layout"], ["fields", "Fields"], ["preview", "Preview"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setPane(id)} className={cn("flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors", pane === id ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white" : "text-slate-500")}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[272px_minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className={cn(pane === "layout" ? "block" : "hidden xl:block")}>{layoutPane}</div>
        <div className={cn(pane === "fields" ? "block" : "hidden xl:block")}>
          <Card className="p-4">{fieldsPane}</Card>
        </div>
        <div className={cn(pane === "preview" ? "block" : "hidden xl:block")}>
          <Card className="h-[760px] overflow-hidden xl:sticky xl:top-24">{preview}</Card>
        </div>
      </div>

      <AvatarPicker
        open={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        value={content.profile.avatar}
        onPick={(url) => {
          updateProfile({ avatar: url });
          toast("Photo updated");
        }}
      />
    </EditorProvider>
  );
}

/* ---------------- panes ---------------- */

function Panel({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-3.5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon size={14} />
        </span>
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

function Slider({
  label, value, min, max, step, onChange, format,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format: (v: number) => string;
}) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600 dark:text-zinc-400">{label}</span>
        <span className="font-semibold tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600 dark:bg-zinc-700"
      />
    </div>
  );
}

function ProfileFieldsPane({
  onPickAvatar, onToggle, onMove, onRemove, onAdd,
}: {
  onPickAvatar: () => void;
  onToggle: (key: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: (key: string) => void;
  onAdd: (key: string) => void;
}) {
  const { content, updateProfile } = useContent();
  const { design, update } = useDesign();
  const { profile, profileFields } = content;
  const sort = useSortable(profileFields, onMove);
  const missing = PROFILE_FIELDS.filter((f) => !profileFields.some((p) => p.key === f.key));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <User size={15} />
        </span>
        <div>
          <h3 className="text-sm font-bold">Profile header</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Reorder, hide or edit each row</p>
        </div>
      </div>

      {/* avatar + alignment, mirroring the header layout */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Avatar</p>
          <button onClick={onPickAvatar} className="group relative">
            <img src={profile.avatar} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/55 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ImagePlus size={16} />
            </span>
          </button>
        </div>
        <div className="rounded-xl border border-slate-200 p-3 dark:border-zinc-800">
          <p className="mb-2 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">Align</p>
          <div className="flex gap-1.5">
            {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([id, Icon]) => (
              <button
                key={id}
                onClick={() => update({ avatarAlign: id })}
                aria-label={`Align ${id}`}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center rounded-lg border transition-colors",
                  design.avatarAlign === id
                    ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/15"
                    : "border-slate-200 text-slate-400 dark:border-zinc-700",
                )}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {profileFields.map((f, i) => {
          const def = profileFieldDef(f.key);
          if (!def) return null;
          const value = def.path ? String((profile as unknown as Record<string, unknown>)[def.path] ?? "") : "";
          return (
            <SortRow
              key={f.key}
              dragging={sort.dragKey === f.key}
              showLineBefore={sort.overIndex === i && sort.dragKey !== null && sort.dragKey !== f.key}
              innerRef={(el) => sort.register(f.key, el)}
            >
              <div className={cn("rounded-xl border p-2.5 dark:border-zinc-800", f.visible ? "border-slate-200" : "border-dashed border-slate-300 opacity-60")}>
                <div className="flex items-center gap-2">
                  <span onPointerDown={sort.start(f.key, i)} style={{ touchAction: "none" }} className="cursor-grab text-slate-300 active:cursor-grabbing dark:text-zinc-600">
                    <GripVertical size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold">{def.label}</span>
                  <button onClick={() => onToggle(f.key)} aria-label={f.visible ? `Hide ${def.label}` : `Show ${def.label}`} className={cn("rounded-md p-1", f.visible ? "text-brand-600" : "text-slate-400")}>
                    {f.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => onRemove(f.key)} aria-label={`Remove ${def.label}`} className="rounded-md p-1 text-slate-400 hover:text-rose-600">
                    <Trash2 size={14} />
                  </button>
                </div>

                {def.type === "image" && (
                  <button onClick={onPickAvatar} className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-300 p-2 text-left text-[11px] text-slate-500 hover:border-brand-400 dark:border-zinc-700">
                    <ImagePlus size={14} /> Change photo
                  </button>
                )}
                {def.type === "text" && def.path && (
                  <Input className="mt-2 h-9 text-sm" value={value} placeholder={def.placeholder} onChange={(e) => updateProfile({ [def.path!]: e.target.value })} />
                )}
                {def.type === "textarea" && def.path && (
                  <Textarea rows={2} className="mt-2 text-sm" value={value} placeholder={def.placeholder} onChange={(e) => updateProfile({ [def.path!]: e.target.value })} />
                )}
                {def.key === "org" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Input className="h-9 text-sm" value={profile.org.name} placeholder="Organisation" onChange={(e) => updateProfile({ org: { ...profile.org, name: e.target.value } })} />
                    <Input className="h-9 text-sm" value={profile.org.initials} placeholder="Monogram" onChange={(e) => updateProfile({ org: { ...profile.org, initials: e.target.value } })} />
                    <Input className="col-span-2 h-9 text-sm" value={profile.org.note} placeholder="Note" onChange={(e) => updateProfile({ org: { ...profile.org, note: e.target.value } })} />
                  </div>
                )}
                {def.key === "stats" && (
                  <div className="mt-2 space-y-2">
                    {(["a", "b", "c"] as const).map((slot) => (
                      <div key={slot} className="grid grid-cols-2 gap-2">
                        <Input className="h-9 text-sm" value={profile.stats[slot]} placeholder="Value" onChange={(e) => updateProfile({ stats: { ...profile.stats, [slot]: e.target.value } })} />
                        <Input className="h-9 text-sm" value={profile.statLabels[slot]} placeholder="Label" onChange={(e) => updateProfile({ statLabels: { ...profile.statLabels, [slot]: e.target.value } })} />
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Show the numbers strip</span>
                      <Switch checked={design.showStats} onChange={(v) => update({ showStats: v })} label="Show stats" />
                    </div>
                  </div>
                )}
              </div>
            </SortRow>
          );
        })}
      </div>

      {missing.length > 0 && (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Removed rows</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((f) => (
              <button key={f.key} onClick={() => onAdd(f.key)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-[11px] font-semibold hover:border-brand-400 dark:border-zinc-700">
                <Plus size={11} /> {f.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockFieldsPane({
  block,
  onChange,
}: {
  block: { id: string; type: string; props: Record<string, unknown> };
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const def = getDef(block.type);
  if (!def) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <BlockIcon type={block.type} size={15} />
        </span>
        <div>
          <h3 className="text-sm font-bold">{def.label}</h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">{def.desc}</p>
        </div>
      </div>
      {!def.noHeader && (
        <>
          <Field label="Title">
            <Input value={String(block.props.title ?? "")} placeholder={String(def.defaults.title ?? "")} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Subtitle">
            <Input value={String(block.props.subtitle ?? "")} onChange={(e) => onChange({ subtitle: e.target.value })} />
          </Field>
        </>
      )}
      {def.collection ? (
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          This block lists your {def.collection}. Add or edit those items from their own tab in the sidebar.
        </p>
      ) : def.fields.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          This block has no extra options — edit its wording above or directly on the preview.
        </p>
      ) : (
        <p className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800/60 dark:text-zinc-400">
          Full options for this block live in the page editor. Open it from Design &amp; blocks.
        </p>
      )}
    </div>
  );
}

function AvatarPicker({
  open, onClose, value, onPick,
}: {
  open: boolean; onClose: () => void; value: string; onPick: (url: string) => void;
}) {
  const [url, setUrl] = useState(value);
  useEffect(() => setUrl(value), [value, open]);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <Sheet open={open} onClose={onClose} title="Profile photo">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <img src={url} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Current photo</p>
            <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">{url}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Choose one</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_PRESETS.map((src) => (
              <button key={src} onClick={() => setUrl(src)} aria-label="Use this photo" className={cn("overflow-hidden rounded-xl transition-transform active:scale-90", url === src && "ring-2 ring-brand-600 ring-offset-2 dark:ring-offset-zinc-900")}>
                <img src={src} alt="" className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <Field label="Or paste an image URL">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
        </Field>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setUrl(String(reader.result));
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
        <Button full variant="outline" onClick={() => fileRef.current?.click()}>
          <ImagePlus size={15} /> Upload from this device
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="lg" onClick={onClose}>Cancel</Button>
          <Button full size="lg" onClick={() => { onPick(url); onClose(); }}>
            <Check size={16} /> Use this photo
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

