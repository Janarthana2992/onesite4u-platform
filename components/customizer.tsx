"use client";

import { useState, type CSSProperties } from "react";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutGrid,
  Layers,
  Palette,
  RotateCcw,
  Sparkles,
  Type,
} from "lucide-react";
import {
  BANNERS,
  BUTTON_SHAPES,
  CARD_STYLES,
  FONTS,
  PALETTES,
  RADII,
  SECTION_META,
  TEMPLATES,
  bannerById,
  fontById,
  type Template,
} from "@/data/design";
import { DEFAULT_DESIGN, designVars, useDesign } from "@/components/design-store";
import { useContent } from "@/components/content-store";
import { BlockManager } from "@/components/block-manager";
import { Switch, cn } from "@/components/ui";
import { useToast } from "@/components/providers";

const TABS = [
  { id: "sections", label: "Blocks", icon: Layers },
  { id: "templates", label: "Templates", icon: Sparkles },
  { id: "banner", label: "Banner", icon: ImageIcon },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "fonts", label: "Fonts", icon: Type },
  { id: "layout", label: "Layout", icon: LayoutGrid },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Customizer({ className, hideTabs = [] }: { className?: string; hideTabs?: TabId[] }) {
  const { design, update, applyTemplate, reset, isDefault } = useDesign();
  const { content } = useContent();
  const { toast } = useToast();
  const visibleTabs = TABS.filter((t) => !hideTabs.includes(t.id));
  const [tab, setTab] = useState<TabId>(visibleTabs[0]?.id ?? "templates");

  // A section needs content before it can appear on the public page.
  const itemCount: Record<string, number> = {
    quickInfo: content.profile.phone || content.profile.email ? 1 : 0,
    links: content.links.filter((l) => l.visible).length,
    services: content.services.length,
    assistant: content.assistant.enabled ? content.knowledge.length : 0,
    reviews: content.reviews.length,
    experience: content.experience.length,
    clients: content.clients.length,
    gallery: content.gallery.length,
    event: content.events.length,
    jobs: content.jobs.filter((j) => j.open).length,
    newsletter: 1,
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-1.5">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              tab === id
                ? "bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {tab === "templates" && (
        <Panel
          title="UI templates"
          hint="One tap swaps colors, fonts, corners, banner and card style."
        >
          <div className="grid grid-cols-2 gap-2.5">
            {TEMPLATES.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                active={design.templateId === t.id}
                onClick={() => {
                  applyTemplate(t.id);
                  toast(`${t.name} template applied`);
                }}
              />
            ))}
          </div>
        </Panel>
      )}

      {tab === "banner" && (
        <Panel title="Profile banner" hint="A LinkedIn-style cover behind your photo.">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-zinc-800">
            <div>
              <p className="text-sm font-medium">Show banner</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Hide it for a compact header</p>
            </div>
            <Switch
              checked={design.showBanner}
              onChange={(v) => update({ showBanner: v })}
              label="Show banner"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {BANNERS.map((b) => (
              <button
                key={b.id}
                onClick={() => update({ bannerId: b.id })}
                className={cn(
                  "group overflow-hidden rounded-xl border-2 text-left transition-all active:scale-95",
                  design.bannerId === b.id
                    ? "border-brand-600 ring-2 ring-brand-500/30"
                    : "border-transparent hover:border-slate-300 dark:hover:border-zinc-700",
                )}
              >
                <span
                  className="relative block h-14 w-full"
                  style={b.kind === "gradient" ? { backgroundImage: b.css } : undefined}
                >
                  {b.kind === "photo" && (
                    <>
                      <img src={b.url} alt="" className="h-full w-full object-cover" />
                      <span
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(180deg, rgb(var(--c-900) / 0.1), rgb(var(--c-900) / 0.7))",
                        }}
                      />
                    </>
                  )}
                </span>
                <span className="block px-2 py-1.5 text-[11px] font-medium">{b.name}</span>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {tab === "colors" && (
        <>
          <Panel title="Primary color" hint="Buttons, highlights and links.">
            <Swatches
              active={design.paletteId}
              onPick={(id) => update({ paletteId: id })}
            />
          </Panel>
          <Panel title="Accent color" hint="Gradients and secondary emphasis.">
            <Swatches active={design.accentId} onPick={(id) => update({ accentId: id })} />
          </Panel>
          <div
            className="rounded-2xl p-4 text-white shadow-lg"
            style={{
              backgroundImage: "linear-gradient(120deg, rgb(var(--c-600)), rgb(var(--a-500)))",
            }}
          >
            <p className="text-sm font-semibold">Live preview</p>
            <p className="text-xs text-white/80">Primary to accent gradient used across the profile.</p>
          </div>
        </>
      )}

      {tab === "fonts" && (
        <Panel title="Font family" hint="Headline and body pairing.">
          <div className="space-y-2">
            {FONTS.map((f) => {
              const active = design.fontId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => update({ fontId: f.id })}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all active:scale-[0.98]",
                    active
                      ? "border-brand-600 bg-brand-50/60 ring-1 ring-brand-500/30 dark:bg-brand-500/10"
                      : "border-slate-200 hover:border-slate-300 dark:border-zinc-800 dark:hover:border-zinc-700",
                  )}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold dark:bg-zinc-800"
                    style={{ fontFamily: f.head }}
                  >
                    Aa
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" style={{ fontFamily: f.head }}>
                      Sheela Bhaskaran
                    </span>
                    <span
                      className="block truncate text-xs text-slate-500 dark:text-zinc-400"
                      style={{ fontFamily: f.body }}
                    >
                      {f.name} · {f.note}
                    </span>
                  </span>
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
                </button>
              );
            })}
          </div>
        </Panel>
      )}

      {tab === "layout" && (
        <>
          <Panel title="Corner radius">
            <div className="grid grid-cols-3 gap-2">
              {RADII.map((r) => (
                <button
                  key={r.id}
                  onClick={() => update({ radiusId: r.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-95",
                    design.radiusId === r.id
                      ? "border-brand-600 bg-brand-50/60 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-zinc-800",
                  )}
                >
                  <span
                    className="h-8 w-12 border-2 border-brand-500 bg-brand-100 dark:bg-brand-500/20"
                    style={{ borderRadius: r.xxl }}
                  />
                  <span className="text-[11px] font-medium">{r.name}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Card style">
            <div className="grid grid-cols-4 gap-2">
              {CARD_STYLES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => update({ cardStyle: c.id })}
                  data-card={c.id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-2 transition-all active:scale-95",
                    design.cardStyle === c.id
                      ? "border-brand-600 bg-brand-50/60 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-zinc-800",
                  )}
                >
                  <span className="os-card h-8 w-full rounded-lg border border-slate-200/70 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900" />
                  <span className="text-[10px] font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Button shape">
            <div className="grid grid-cols-3 gap-2">
              {BUTTON_SHAPES.map((b) => (
                <button
                  key={b.id}
                  onClick={() => update({ buttonShape: b.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all active:scale-95",
                    design.buttonShape === b.id
                      ? "border-brand-600 bg-brand-50/60 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-zinc-800",
                  )}
                >
                  <span
                    className="flex h-7 w-full items-center justify-center bg-gradient-to-r from-brand-600 to-accent-600 text-[10px] font-semibold text-white"
                    style={{ borderRadius: b.radius || "var(--r-xl)" }}
                  >
                    Book
                  </span>
                  <span className="text-[11px] font-medium">{b.name}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Header details">
            <ToggleRow
              label="Stats strip"
              desc="Clients · rating · experience"
              checked={design.showStats}
              onChange={(v) => update({ showStats: v })}
            />
            <ToggleRow
              label="Availability dot"
              desc="Green badge on the profile photo"
              checked={design.showAvailability}
              onChange={(v) => update({ showAvailability: v })}
            />
          </Panel>
        </>
      )}

      {tab === "sections" && <BlockManager compact />}

      <button
        onClick={() => {
          reset();
          toast("Design reset to default", "info");
        }}
        disabled={isDefault}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={14} /> Reset to default
      </button>
      <p className="text-center text-[11px] text-slate-400">
        Demo mode · design is saved in this browser only
      </p>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-2">
        <h3 className="text-sm font-bold">{title}</h3>
        {hint && <p className="text-[11px] text-slate-500 dark:text-zinc-400">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-3 first-of-type:border-0 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{desc}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function Swatches({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          onClick={() => onPick(p.id)}
          title={p.name}
          aria-label={p.name}
          className={cn(
            "aspect-square rounded-xl transition-all active:scale-90",
            active === p.id
              ? "ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900"
              : "hover:scale-105",
          )}
          style={{ backgroundColor: p.hex }}
        />
      ))}
    </div>
  );
}

function TemplateCard({
  template,
  active,
  onClick,
}: {
  template: Template;
  active: boolean;
  onClick: () => void;
}) {
  const vars = designVars({
    ...DEFAULT_DESIGN,
    paletteId: template.palette,
    accentId: template.accent,
    fontId: template.font,
    radiusId: template.radius,
    buttonShape: template.button,
  }) as CSSProperties;
  const banner = bannerById(template.banner);
  const font = fontById(template.font);

  return (
    <button
      onClick={onClick}
      style={vars}
      data-card={template.card}
      className={cn(
        "overflow-hidden rounded-2xl border-2 text-left transition-all active:scale-95",
        active ? "border-brand-600 ring-2 ring-brand-500/30" : "border-slate-200 dark:border-zinc-800",
      )}
    >
      <div
        className="relative h-12"
        style={banner.kind === "gradient" ? { backgroundImage: banner.css } : undefined}
      >
        {banner.kind === "photo" && (
          <>
            <img src={banner.url} alt="" className="h-full w-full object-cover" />
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(180deg, rgb(var(--c-900) / 0.1), rgb(var(--c-900) / 0.7))",
              }}
            />
          </>
        )}
        <span className="absolute -bottom-3 left-2 h-7 w-7 rounded-lg bg-white shadow ring-2 ring-white dark:bg-zinc-800 dark:ring-zinc-900" />
      </div>
      <div className="bg-white px-2 pb-2.5 pt-4 dark:bg-zinc-900">
        <p className="truncate text-xs font-bold" style={{ fontFamily: font.head }}>
          {template.name}
        </p>
        <p
          className="truncate text-[10px] text-slate-500 dark:text-zinc-400"
          style={{ fontFamily: font.body }}
        >
          {template.tagline}
        </p>
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className="h-4 flex-1 bg-gradient-to-r from-brand-600 to-accent-600"
            style={{ borderRadius: "var(--r-btn)" }}
          />
          <span className="h-4 w-4 rounded-full bg-brand-100 dark:bg-brand-500/30" />
        </div>
      </div>
    </button>
  );
}

