"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  IndianRupee,
  Instagram,
  LayoutDashboard,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Navigation,
  Palette,
  Phone,
  QrCode,
  Send,
  Share2,
  Sparkles,
  Star,
  Sun,
  UserPlus,
  Users,
  Youtube,
} from "lucide-react";
import { type Job, type LinkIcon, type Service } from "@/data/mock";
import { bannerById } from "@/data/design";
import { getDef } from "@/data/blocks";
import { Button, Card, IconBtn, InlineText, SectionHeader, cn } from "@/components/ui";

type Wide = { wide?: boolean };
import { useTheme, useToast } from "@/components/providers";
import { useDesign, useScrollScope } from "@/components/design-store";
import { useContent, type Profile } from "@/components/content-store";
import { useSectionLabel } from "@/components/blocks/context";
import { useLiveEdit } from "@/components/live-edit";
import { profileFieldDef } from "@/data/profile-fields";
import { useFakeSubmit } from "@/lib/hooks";

/** Profile rows the owner has switched on, in their chosen order. */
function useProfileRows(group: "header" | "contact") {
  const { content } = useContent();
  return content.profileFields
    .filter((f) => f.visible)
    .map((f) => ({ ...f, def: profileFieldDef(f.key) }))
    .filter((f) => f.def?.group === group);
}

/** Editable text on the preview when the live editor is open. */
function ProfileText({
  field,
  value,
  className,
  placeholder,
  multiline,
}: {
  field: keyof Profile;
  value: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const { live } = useLiveEdit();
  const { updateProfile } = useContent();
  if (!live) return <span className={className}>{value}</span>;
  return (
    <InlineText
      value={value}
      placeholder={placeholder}
      multiline={multiline}
      onChange={(v) => updateProfile({ [field]: v } as Partial<Profile>)}
      className={className}
    />
  );
}

/* ---------------- Header (LinkedIn-style banner) ---------------- */

export function Header({
  onShare,
  onQr,
  onCustomize,
}: {
  onShare: () => void;
  onQr: () => void;
  onCustomize?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const { design } = useDesign();
  const { content } = useContent();
  const { profile } = content;
  const headerRows = useProfileRows("header");
  const contactRows = useProfileRows("contact");
  const on = (key: string) =>
    headerRows.some((r) => r.key === key) || contactRows.some((r) => r.key === key);
  const banner = bannerById(design.bannerId);

  const tools = (
    <div className="os-header-tools absolute right-4 top-4 z-10 flex gap-2">
      <IconBtn onClick={toggle} label="Toggle dark mode">
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </IconBtn>
      {onCustomize && (
        <IconBtn onClick={onCustomize} label="Customize design">
          <Palette size={17} />
        </IconBtn>
      )}
      <IconBtn onClick={onQr} label="QR code">
        <QrCode size={17} />
      </IconBtn>
      <IconBtn onClick={onShare} label="Share profile">
        <Share2 size={17} />
      </IconBtn>
    </div>
  );

  return (
    <header className="relative">
      {design.showBanner ? (
        <div
          className="relative h-40 overflow-hidden"
          style={banner.kind === "gradient" ? { backgroundImage: banner.css } : undefined}
        >
          {banner.kind === "photo" && (
            <>
              <img src={banner.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgb(var(--c-900) / 0.15), rgb(var(--c-900) / 0.75))",
                  opacity: (banner.tint ?? 40) / 100 + 0.35,
                }}
              />
            </>
          )}
          <div className="os-header-brand absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Sparkles size={12} /> OneSite4U
          </div>
          {tools}
        </div>
      ) : (
        <div className="relative h-16 bg-slate-100 dark:bg-zinc-900">{tools}</div>
      )}

      <div className={cn("px-5", design.showBanner ? "-mt-12" : "-mt-2")}>
        <div
          className={cn(
            "flex items-end gap-3",
            design.avatarAlign === "center" && "flex-col items-center",
            design.avatarAlign === "right" && "flex-row-reverse",
            design.avatarAlign === "left" && "justify-between",
          )}
        >
          {on("avatar") && <Avatar size="h-24 w-24" />}
          {on("status") && (
            <div className="mb-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <ProfileText field="responseNote" value={profile.responseNote} placeholder="Status" />
            </div>
          )}
        </div>

        <div className={cn("mt-3", design.avatarAlign === "center" && "text-center")}>
          {on("name") && (
            <div className={cn("flex items-center gap-1.5", design.avatarAlign === "center" && "justify-center")}>
              <h1 className="text-2xl font-bold tracking-tight">
                <ProfileText field="name" value={profile.name} placeholder="Your name" />
              </h1>
              <BadgeCheck size={22} className="shrink-0 fill-brand-500 text-white dark:text-zinc-950" />
            </div>
          )}
          {on("title") && (
            <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
              <ProfileText field="title" value={profile.title} placeholder="What you do" />
            </p>
          )}
          {on("tagline") && (
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
              <ProfileText field="tagline" value={profile.tagline} placeholder="One line about your work" multiline />
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
            {on("location") && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} /> {profile.city}
              </span>
            )}
            {on("website") && (
              <span className="inline-flex items-center gap-1">
                <Globe size={12} /> {profile.website}
              </span>
            )}
            {on("stats") && (
              <span className="inline-flex items-center gap-1 font-medium text-brand-600 dark:text-brand-300">
                <Users size={12} /> {profile.stats.a} {profile.statLabels.a.toLowerCase()}
              </span>
            )}
          </div>

          {on("org") && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white p-2.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 text-sm font-bold text-white">
                {profile.org.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">{profile.org.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{profile.org.note}</p>
              </div>
            </div>
          )}
        </div>

        {on("stats") && design.showStats && (
          <div className="mt-3 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200/70 bg-white py-3 shadow-sm dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            <Stat value={profile.stats.a} label={profile.statLabels.a} />
            <Stat value={profile.stats.b} label={profile.statLabels.b} star />
            <Stat value={profile.stats.c} label={profile.statLabels.c} />
          </div>
        )}
      </div>
    </header>
  );
}

/** Profile photo; clicking it in the live editor opens the picker. */
export function Avatar({ size = "h-24 w-24", rounded = "rounded-2xl" }: { size?: string; rounded?: string }) {
  const { content } = useContent();
  const { design } = useDesign();
  const { live, onPickAvatar } = useLiveEdit();
  const { profile } = content;

  return (
    <div className="relative inline-block shrink-0">
      <img
        src={profile.avatar}
        alt={profile.name}
        className={cn(size, rounded, "object-cover shadow-xl ring-4 ring-slate-50 dark:ring-zinc-950")}
      />
      {design.showAvailability && (
        <span
          title="Available now"
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-zinc-950"
        />
      )}
      {live && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPickAvatar?.();
          }}
          className={cn(
            size,
            rounded,
            "absolute inset-0 flex items-center justify-center bg-slate-900/55 text-white opacity-0 transition-opacity hover:opacity-100",
          )}
        >
          <Camera size={20} />
        </button>
      )}
    </div>
  );
}

function Stat({ value, label, star }: { value: string; label: string; star?: boolean }) {
  return (
    <div className="text-center">
      <p className="flex items-center justify-center gap-1 text-base font-bold">
        {value}
        {star && <Star size={13} className="fill-amber-400 text-amber-400" />}
      </p>
      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}


/* ---------------- Desktop web layout pieces ---------------- */

/** Full-bleed cover used by the desktop hero. */
function HeroStatusChip() {
  const { content } = useContent();
  return (
    <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      {content.profile.responseNote}
    </span>
  );
}

export function HeroBanner({ children }: { children?: React.ReactNode }) {
  const { design } = useDesign();
  const banner = bannerById(design.bannerId);
  if (!design.showBanner) return <div className="h-8" />;
  return (
    <div
      className="relative h-64 overflow-hidden"
      style={banner.kind === "gradient" ? { backgroundImage: banner.css } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 16% 18%, white 0, transparent 40%), radial-gradient(circle at 84% 6%, white 0, transparent 34%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(0_0_0/0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-50 to-transparent dark:from-zinc-950" />
      {banner.kind === "photo" && (
        <>
          <img src={banner.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(180deg, rgb(var(--c-900) / 0.15), rgb(var(--c-900) / 0.75))",
              opacity: (banner.tint ?? 40) / 100 + 0.35,
            }}
          />
        </>
      )}
      <div className="mx-auto flex h-full max-w-6xl items-start justify-between px-6 py-6">
        <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Sparkles size={13} /> OneSite4U
        </span>
        <HeroStatusChip />
      </div>
      {children}
    </div>
  );
}

/** Sticky top bar for the desktop web view. */
export function DesktopNav({
  onBook,
  onShare,
  onQr,
  onCustomize,
}: {
  onBook: () => void;
  onShare: () => void;
  onQr: () => void;
  onCustomize?: () => void;
}) {
  const { theme, toggle } = useTheme();
  const { design } = useDesign();
  const { content } = useContent();
  const { profile } = content;
  const { scrollToId, scrollToTop } = useScrollScope();
  const byType = (type: string) => design.blocks.find((b) => b.type === type && b.visible);

  const anchors = [
    { id: "services", type: "services", fallback: "Services" },
    { id: "gallery", type: "gallery", fallback: "Gallery" },
    { id: "contact", type: "quickInfo", fallback: "Contact" },
  ]
    .map((a) => ({ ...a, block: byType(a.type) }))
    .filter((a) => a.block)
    .map((a) => {
      const t = a.block!.props.title;
      const def = getDef(a.type)?.defaults.title;
      const renamed = typeof t === "string" && t.trim() && t !== def;
      return { ...a, label: renamed ? (t as string) : a.fallback };
    });

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
        <button onClick={scrollToTop} className="flex items-center gap-2.5">
          <img src={profile.avatar} alt="" className="h-9 w-9 rounded-lg object-cover" />
          <span className="text-left leading-tight">
            <span className="block text-sm font-bold">{profile.name}</span>
            <span className="block text-[11px] text-slate-500 dark:text-zinc-400">{profile.title}</span>
          </span>
        </button>

        <div className="ml-6 flex items-center gap-1">
          {anchors.map((a) => (
            <button
              key={a.id}
              onClick={() => scrollToId(a.id)}
              className="max-w-[150px] truncate rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              title={a.label}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={toggle} aria-label="Toggle dark mode" className={iconBtn}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {onCustomize && (
            <button onClick={onCustomize} aria-label="Customize design" className={iconBtn}>
              <Palette size={18} />
            </button>
          )}
          <button onClick={onQr} aria-label="QR code" className={iconBtn}>
            <QrCode size={18} />
          </button>
          <button onClick={onShare} aria-label="Share profile" className={iconBtn}>
            <Share2 size={18} />
          </button>
          <Button className="ml-1.5" onClick={onBook}>
            <CalendarDays size={16} /> Book Appointment
          </Button>
        </div>
      </div>
    </nav>
  );
}

/** Sticky sidebar identity card for the desktop web view. */
export function IdentityCard() {
  const { design } = useDesign();
  const { content } = useContent();
  const { profile } = content;
  const headerRows = useProfileRows("header");
  const contactRows = useProfileRows("contact");
  const on = (key: string) =>
    headerRows.some((r) => r.key === key) || contactRows.some((r) => r.key === key);
  return (
    <Card className="os-glass overflow-hidden shadow-[0_20px_50px_-24px_rgb(15_23_42/0.35)] dark:shadow-[0_20px_50px_-24px_rgb(0_0_0/0.8)]">
      <div className="p-5">
        {on("avatar") && <Avatar size="h-28 w-28" />}

        {on("name") && (
          <div className="mt-4 flex items-center gap-1.5">
            <h1 className="text-xl font-bold tracking-tight">
              <ProfileText field="name" value={profile.name} placeholder="Your name" />
            </h1>
            <BadgeCheck size={20} className="shrink-0 fill-brand-500 text-white dark:text-zinc-900" />
          </div>
        )}
        {on("title") && (
          <p className="text-sm font-semibold text-brand-600 dark:text-brand-300">
            <ProfileText field="title" value={profile.title} placeholder="What you do" />
          </p>
        )}
        {on("tagline") && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            <ProfileText field="tagline" value={profile.tagline} placeholder="One line about your work" multiline />
          </p>
        )}

        <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-zinc-400">
          {on("location") && (
            <p className="flex items-center gap-1.5">
              <MapPin size={13} /> {profile.city}
            </p>
          )}
          {on("website") && (
            <p className="flex items-center gap-1.5">
              <Globe size={13} /> {profile.website}
            </p>
          )}
          {on("stats") && (
            <p className="flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-300">
              <Users size={13} /> {profile.stats.a} {profile.statLabels.a.toLowerCase()}
            </p>
          )}
        </div>

        {on("org") && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-zinc-800/60">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-600 text-sm font-bold text-white">
            {profile.org.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{profile.org.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">{profile.org.note}</p>
          </div>
        </div>
        )}
      </div>

      {on("stats") && design.showStats && (
        <div className="grid grid-cols-3 divide-x divide-slate-200 border-t border-slate-200 py-3 dark:divide-zinc-800 dark:border-zinc-800">
          <Stat value={profile.stats.a} label={profile.statLabels.a} />
          <Stat value={profile.stats.b} label={profile.statLabels.b} star />
          <Stat value={profile.stats.c} label={profile.statLabels.c} />
        </div>
      )}
    </Card>
  );
}

/* ---------------- Action buttons ---------------- */

function downloadVCard(profile: Profile) {
  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    "ORG:Octogon Mitra Investments",
    "TITLE:CEO",
    `TEL;TYPE=CELL:${profile.phone.replace(/\s/g, "")}`,
    `EMAIL:${profile.email}`,
    `URL:https://${profile.website}`,
    `ADR;TYPE=WORK:;;${profile.location}`,
    "END:VCARD",
  ].join("\n");
  const blob = new Blob([vcf], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Sheela-Bhaskaran.vcf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ActionButtons() {
  const { toast } = useToast();
  const { content } = useContent();
  const { profile } = content;
  const items = [
    {
      label: "Call",
      icon: Phone,
      href: `tel:${profile.phone.replace(/\s/g, "")}`,
      color: "from-emerald-400 to-green-600",
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent("Hi Sheela, I found you on OneSite4U!")}`,
      color: "from-green-400 to-emerald-600",
    },
    { label: "Email", icon: Mail, href: `mailto:${profile.email}`, color: "from-sky-400 to-blue-600" },
    {
      label: "Save Contact",
      icon: UserPlus,
      onClick: () => {
        downloadVCard(profile);
        toast("Contact card saved to your device");
      },
      color: "from-brand-500 to-accent-600",
    },
  ];

  return (
    <section className="grid grid-cols-4 gap-2">
      {items.map(({ label, icon: Icon, href, onClick, color }) => {
        const inner = (
          <>
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-all group-hover:-translate-y-0.5 group-hover:shadow-xl group-active:scale-90",
                color,
              )}
            >
              <Icon size={22} />
            </span>
            <span className="text-center text-[11px] font-medium leading-tight text-slate-600 dark:text-zinc-400">
              {label}
            </span>
          </>
        );
        const cls = "group flex flex-col items-center gap-1.5";
        return href ? (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className={cls}
          >
            {inner}
          </a>
        ) : (
          <button key={label} onClick={onClick} className={cls}>
            {inner}
          </button>
        );
      })}
    </section>
  );
}

/* ---------------- Quick info ---------------- */

export function QuickInfo({ wide }: Wide) {
  const { toast } = useToast();
  const { content } = useContent();
  const { profile } = content;
  const label = useSectionLabel("quickInfo", "Quick Info", "Reach out directly");
  const contactRows = useProfileRows("contact");
  const copy = (value: string, field: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    toast(`${field} copied to clipboard`);
  };
  const byKey: Record<string, { icon: typeof Phone; label: string; value: string; href?: string }> = {
    phone: { icon: Phone, label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
    email: { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    website: { icon: Globe, label: "Website", value: profile.website, href: `https://${profile.website}` },
    location: { icon: MapPin, label: "Location", value: profile.location },
  };
  const rows = contactRows.map((r) => byKey[r.key]).filter(Boolean);

  return (
    <section id="contact" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <Card className={cn(wide ? "p-2" : "divide-y divide-slate-100 dark:divide-zinc-800")}>
        <div className={cn(wide && "grid grid-cols-2 gap-2")}>
        {rows.map((r) => (
          <div
            key={r.label}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              wide && "rounded-xl border border-slate-100 dark:border-zinc-800",
              !wide && "border-b border-slate-100 last:border-0 dark:border-zinc-800",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <r.icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-zinc-500">{r.label}</p>
              {r.href ? (
                <a
                  href={r.href}
                  target={r.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="block truncate text-sm font-medium"
                >
                  {r.value}
                </a>
              ) : (
                <p className="truncate text-sm font-medium">{r.value}</p>
              )}
            </div>
            <button
              onClick={() => copy(r.value, r.label)}
              aria-label={`Copy ${r.label}`}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              <Copy size={16} />
            </button>
          </div>
        ))}
        </div>
        <MapPlaceholder />
      </Card>
    </section>
  );
}

function MapPlaceholder() {
  const { toast } = useToast();
  const { content } = useContent();
  return (
    <div className="p-3">
      <div className="relative h-36 overflow-hidden rounded-xl bg-[#e6efe3] dark:bg-zinc-800">
        <svg
          className="absolute inset-0 h-full w-full text-white dark:text-zinc-700"
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
        >
          <g stroke="currentColor" fill="none" strokeLinecap="round">
            <path d="M0 40 C 80 30, 140 70, 400 55" strokeWidth="10" />
            <path d="M0 110 C 100 120, 200 90, 400 105" strokeWidth="8" />
            <path d="M90 0 C 100 60, 80 100, 95 150" strokeWidth="7" />
            <path d="M250 0 C 240 60, 270 100, 255 150" strokeWidth="7" />
            <path d="M330 0 L 345 150" strokeWidth="4" />
            <path d="M0 75 L 400 80" strokeWidth="3" />
            <path d="M170 0 L 165 150" strokeWidth="3" />
          </g>
          <g fill="#c9dcc2" className="dark:fill-zinc-700/60">
            <rect x="105" y="48" width="55" height="22" rx="3" />
            <rect x="270" y="88" width="50" height="16" rx="3" />
            <rect x="20" y="85" width="60" height="18" rx="3" />
          </g>
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[60%] flex-col items-center">
          <span className="mb-1 max-w-[70%] truncate rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold shadow dark:bg-zinc-900">
            {content.profile.org.name}
          </span>
          <MapPin size={34} className="fill-rose-500 text-white drop-shadow-lg" />
        </div>
        <button
          onClick={() => toast("Opening in Google Maps…", "info")}
          className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow transition-transform active:scale-95 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <Navigation size={12} /> Directions
        </button>
      </div>
    </div>
  );
}

/* ---------------- Links ---------------- */

const linkIcons: Record<LinkIcon, typeof Briefcase> = {
  portfolio: Briefcase,
  linkedin: Linkedin,
  payment: IndianRupee,
  youtube: Youtube,
  brochure: FileText,
  instagram: Instagram,
};

export const linkColors: Record<LinkIcon, string> = {
  portfolio: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  linkedin: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  youtube: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  brochure: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  instagram: "bg-pink-100 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300",
};

export function LinkIconBadge({ icon, className }: { icon: LinkIcon; className?: string }) {
  const Icon = linkIcons[icon];
  return (
    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", linkColors[icon], className)}>
      <Icon size={20} />
    </span>
  );
}

export function LinksSection({ wide }: Wide) {
  const { toast } = useToast();
  const { content } = useContent();
  const links = content.links.filter((l) => l.visible);
  const label = useSectionLabel("links", "Links", "Everything in one place");
  return (
    <section>
      <SectionHeader {...label} wide={wide} />
      <div className={cn(wide ? "grid grid-cols-2 gap-3" : "space-y-2.5")}>
        {links.map((l) => (
          <button
            key={l.id}
            onClick={() => toast(`Opening ${l.title}…`, "info")}
            className="os-card group flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-brand-500/50"
          >
            <LinkIconBadge icon={l.icon} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{l.title}</span>
              <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">{l.subtitle}</span>
            </span>
            <ExternalLink
              size={16}
              className="text-slate-300 transition-colors group-hover:text-brand-500 dark:text-zinc-600"
            />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Services ---------------- */

export function ServicesSection({ onBook, wide }: { onBook: (s: Service) => void } & Wide) {
  const { content } = useContent();
  const { services } = content;
  const label = useSectionLabel("services", "Services", "Book a session that fits your goals");

  return (
    <section id="services" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <div className={cn(wide ? "grid grid-cols-2 gap-4" : "space-y-3")}>
        {services.map((s) => (
          <Card
            key={s.id}
            className={cn(
              "relative flex flex-col p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
              s.popular && "ring-2 ring-brand-500/60",
            )}
          >
            {s.popular && (
              <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Most popular
              </span>
            )}
            <div className="flex flex-1 items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{s.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{s.description}</p>
                <div className="mb-4 mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {s.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} /> 1:1 session
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-bold">₹{s.price.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-slate-400">per session</p>
              </div>
            </div>
            <Button full className="mt-auto pt-0.5" onClick={() => onBook(s)}>
              Book Now <ArrowRight size={16} />
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Gallery ---------------- */

export function GallerySection({ onOpen, wide }: { onOpen: (src: string) => void } & Wide) {
  const { content } = useContent();
  const { gallery } = content;
  const label = useSectionLabel("gallery", "Media Gallery", "Moments and highlights");

  return (
    <section id="gallery" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <div className={cn("grid", wide ? "grid-cols-3 gap-3" : "grid-cols-3 gap-2")}>
        {gallery.map((g, i) => (
          <button
            key={g.id}
            onClick={() => onOpen(g.src)}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-2xl bg-slate-200 dark:bg-zinc-800",
              !wide && i === 0 && "col-span-2 row-span-2",
            )}
          >
            <img
              src={g.src}
              alt={g.caption}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {g.caption}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Event ---------------- */

export function EventSection({ onRsvp, wide }: { onRsvp: () => void } & Wide) {
  const { content } = useContent();
  const event = content.events[0];
  const label = useSectionLabel("event", "Upcoming Event", "Join the community");

  if (!event) return null;

  return (
    <section>
      <SectionHeader {...label} wide={wide} />
      <Card className={cn("overflow-hidden", wide && "flex")}>
        <div
          className={cn(
            "relative bg-gradient-to-br from-accent-500 via-accent-600 to-brand-700",
            wide ? "w-72 shrink-0" : "h-32",
          )}
        >
          <img
            src={event.cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity"
          />
          <div className="absolute left-4 top-4 rounded-xl bg-white px-3 py-1.5 text-center shadow dark:bg-zinc-900">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">{event.month}</p>
            <p className="text-xl font-bold leading-none">{event.day}</p>
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {event.price}
          </span>
        </div>
        <div className={cn("p-4", wide && "flex-1 p-6")}>
          <h3 className={cn("font-bold", wide ? "text-xl" : "text-lg")}>{event.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{event.description}</p>
          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} className="text-brand-500" /> {event.date} · {event.time}
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={15} className="text-brand-500" /> {event.venue}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              {[11, 12, 13, 14].map((n, i) => (
                <img
                  key={n}
                  src={`https://i.pravatar.cc/64?img=${n}`}
                  alt=""
                  className={cn(
                    "h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900",
                    i > 0 && "-ml-2",
                  )}
                />
              ))}
              <span className="ml-2 text-xs text-slate-500 dark:text-zinc-400">+{event.attendees} going</span>
            </div>
            <Button onClick={onRsvp}>RSVP</Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

/* ---------------- Jobs ---------------- */

export function JobsSection({ onApply, wide }: { onApply: (job: Job) => void } & Wide) {
  const { content } = useContent();
  const jobs = content.jobs.filter((j) => j.open);
  const label = useSectionLabel("jobs", "We're Hiring", "Open roles on the team");

  return (
    <section>
      <SectionHeader {...label} wide={wide} />
      <div className={cn(wide ? "grid grid-cols-2 gap-4" : "space-y-3")}>
        {jobs.map((j) => (
          <Card key={j.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                <Building2 size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {j.location} · {j.type}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {j.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{j.pay}</p>
                <p className="text-[11px] text-slate-400">Posted {j.posted}</p>
              </div>
              <Button variant="secondary" onClick={() => onApply(j)}>
                Apply <ChevronRight size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Newsletter ---------------- */

export function NewsletterSection({ wide }: Wide) {
  const { status, submit, reset } = useFakeSubmit(1100);
  const [email, setEmail] = useState("");
  const label = useSectionLabel(
    "newsletter",
    "Subscribe for updates",
    "Occasional updates straight to your inbox. No spam, ever.",
  );

  return (
    <section>
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-accent-500 to-accent-600 text-white shadow-xl shadow-brand-600/25",
          wide ? "p-8" : "p-5",
        )}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/10" />
        <div className={cn("relative", wide && "grid grid-cols-2 items-center gap-8")}>
          <div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Send size={18} />
          </span>
          <h3 className={cn("mt-3 font-bold", wide ? "text-2xl" : "text-lg")}>{label.title}</h3>
          <p className="mt-1 text-sm text-white/80">{label.subtitle}</p>
          </div>
          <div>

          {status === "success" ? (
            <div className={cn("flex items-center gap-3 rounded-2xl bg-white/15 p-3 animate-scale-in", wide ? "mt-0" : "mt-4")}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-white">
                <Check size={18} strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Subscribed successfully!</p>
                <p className="truncate text-xs text-white/80">Welcome aboard, {email}</p>
              </div>
              <button
                onClick={() => {
                  reset();
                  setEmail("");
                }}
                className="text-xs underline"
              >
                Undo
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className={cn("flex gap-2", wide ? "mt-0" : "mt-4")}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-11 min-w-0 flex-1 rounded-xl bg-white/95 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/60"
              />
              <Button type="submit" variant="dark" loading={status === "loading"} className="shrink-0">
                Subscribe
              </Button>
            </form>
          )}
          <p className="mt-3 text-[11px] text-white/60">Join 80+ subscribers · Unsubscribe anytime</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 pb-4 pt-8 text-center dark:border-zinc-800">
      <span className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white">
        <Sparkles size={16} />
      </span>
      <p className="text-xs text-slate-400 dark:text-zinc-500">
        Powered by <span className="font-semibold text-brand-600 dark:text-brand-300">OneSite4U</span> · Your
        business identity, one link.
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Sparkles size={14} /> All profiles
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <LayoutDashboard size={14} /> Admin demo
        </Link>
        <Link
          href="/webview"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <Palette size={14} /> Design studio
        </Link>
      </div>
    </footer>
  );
}
