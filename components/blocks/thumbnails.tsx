"use client";

import {
  AlignLeft,
  Award,
  BadgeCheck,
  Bot,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronsUpDown,
  Clock,
  Contact,
  CreditCard,
  FileDown,
  Files,
  Gauge,
  GraduationCap,
  Hash,
  Heading,
  Heart,
  Image as ImageIcon,
  Images,
  Link2,
  ListChecks,
  ListOrdered,
  Mail,
  MapPin,
  Megaphone,
  MessageSquarePlus,
  Minus,
  Newspaper,
  PanelsTopLeft,
  PieChart,
  Play,
  Quote,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Tags,
  UserSquare2,
  Users,
  UtensilsCrossed,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

export const BLOCK_ICONS: Record<string, typeof Link2> = {
  quickInfo: Contact, links: Link2, socials: Share2, hours: Clock, map: MapPin, contactForm: Mail,
  text: AlignLeft, heading: Heading, imageText: PanelsTopLeft, quote: Quote, experience: Gauge,
  education: GraduationCap, skills: Tags, awards: Award, certifications: BadgeCheck, team: Users, stats: Hash,
  services: Sparkles, pricing: CreditCard, products: ShoppingBag, menu: UtensilsCrossed, downloads: FileDown,
  schedule: ListOrdered, milestones: ListChecks,
  reviews: Star, clients: Building2,
  gallery: Images, video: Play, embed: Files, announcements: Newspaper,
  assistant: Bot, grievance: MessageSquarePlus, event: CalendarDays, jobs: UserSquare2, newsletter: Megaphone,
  cta: Zap, poll: PieChart, support: Heart, countdown: CalendarClock, faq: ChevronsUpDown,
  divider: Minus,
};

/** Layout family each block's thumbnail is drawn from. */
const SHAPE: Record<string, string> = {
  quickInfo: "rows", links: "rows", socials: "chips", hours: "rows", map: "map", contactForm: "form",
  text: "text", heading: "heading", imageText: "split", quote: "quote", experience: "timeline",
  education: "rows", skills: "chips", awards: "rows", certifications: "rows", team: "grid4", stats: "stat",
  services: "cards", pricing: "columns", products: "grid4", menu: "rows", downloads: "rows",
  schedule: "timeline", milestones: "bars",
  reviews: "cards", clients: "grid4",
  gallery: "grid3", video: "media", embed: "split", announcements: "cards",
  assistant: "chat", grievance: "form", event: "split", jobs: "cards", newsletter: "banner",
  cta: "banner", poll: "bars", support: "chips", countdown: "grid4", faq: "rows",
  divider: "divider",
};

const bar = "rounded-full bg-brand-500/35";
const box = "rounded bg-brand-500/20";

/** A small schematic of the block's layout — the visual you grab in the panel. */
export function BlockThumb({ type, className }: { type: string; className?: string }) {
  const shape = SHAPE[type] ?? "rows";

  const inner = () => {
    switch (shape) {
      case "rows":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn(box, "h-3 w-3 shrink-0")} />
                <div className={cn(bar, "h-1.5 flex-1")} />
              </div>
            ))}
          </div>
        );
      case "cards":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            {[0, 1].map((i) => (
              <div key={i} className={cn(box, "h-5 w-full")} />
            ))}
          </div>
        );
      case "grid3":
        return (
          <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className={box} />)}
          </div>
        );
      case "grid4":
        return (
          <div className="grid h-full grid-cols-4 items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={cn(box, "h-4 w-4 rounded-full")} />
                <div className={cn(bar, "h-1 w-full")} />
              </div>
            ))}
          </div>
        );
      case "columns":
        return (
          <div className="grid h-full grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("rounded", i === 1 ? "bg-brand-500/45" : "bg-brand-500/20")} />
            ))}
          </div>
        );
      case "split":
        return (
          <div className="flex h-full gap-1.5">
            <div className={cn(box, "w-2/5")} />
            <div className="flex flex-1 flex-col justify-center gap-1">
              <div className={cn(bar, "h-1.5 w-full")} />
              <div className={cn(bar, "h-1.5 w-4/5")} />
              <div className={cn(bar, "h-1.5 w-3/5")} />
            </div>
          </div>
        );
      case "text":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            {["w-full", "w-full", "w-4/5", "w-3/5"].map((w, i) => (
              <div key={i} className={cn(bar, "h-1.5", w)} />
            ))}
          </div>
        );
      case "heading":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            <div className={cn(bar, "h-1 w-1/4")} />
            <div className="h-3 w-4/5 rounded bg-brand-500/45" />
          </div>
        );
      case "quote":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5 rounded-lg bg-brand-500/25 p-2">
            <div className={cn(bar, "h-1.5 w-full bg-white/70")} />
            <div className={cn(bar, "h-1.5 w-3/5 bg-white/70")} />
          </div>
        );
      case "timeline":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5 pl-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative flex items-center gap-1.5">
                <span className="absolute -left-2 h-1.5 w-1.5 rounded-full bg-brand-500/60" />
                <div className={cn(bar, "h-1.5", i === 1 ? "w-4/5" : "w-full")} />
              </div>
            ))}
            <span className="absolute left-[9px] top-2 h-[calc(100%-16px)] w-px bg-brand-500/30" />
          </div>
        );
      case "bars":
        return (
          <div className="flex h-full flex-col justify-center gap-2">
            {[70, 45, 90].map((w, i) => (
              <div key={i} className="h-1.5 w-full overflow-hidden rounded-full bg-brand-500/15">
                <div className="h-full rounded-full bg-brand-500/60" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        );
      case "chips":
        return (
          <div className="flex h-full flex-wrap content-center gap-1">
            {[10, 14, 8, 12, 9, 11].map((w, i) => (
              <div key={i} className="h-3 rounded-full bg-brand-500/25" style={{ width: w * 2 }} />
            ))}
          </div>
        );
      case "form":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            <div className="h-3 w-full rounded border border-brand-500/35" />
            <div className="h-3 w-full rounded border border-brand-500/35" />
            <div className="h-3 w-1/2 rounded bg-brand-500/60" />
          </div>
        );
      case "chat":
        return (
          <div className="flex h-full flex-col justify-center gap-1.5">
            <div className="flex gap-1"><div className={cn(box, "h-2.5 w-2.5 rounded-full")} /><div className="h-2.5 w-3/5 rounded-md bg-brand-500/25" /></div>
            <div className="flex justify-end"><div className="h-2.5 w-2/5 rounded-md bg-brand-500/50" /></div>
            <div className="flex gap-1"><div className={cn(box, "h-2.5 w-2.5 rounded-full")} /><div className="h-2.5 w-4/5 rounded-md bg-brand-500/25" /></div>
          </div>
        );
      case "banner":
        return (
          <div className="flex h-full items-center justify-between gap-2 rounded-lg bg-gradient-to-r from-brand-500/50 to-accent-500/50 px-2">
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-4/5 rounded-full bg-white/80" />
              <div className="h-1 w-3/5 rounded-full bg-white/60" />
            </div>
            <div className="h-3.5 w-8 rounded bg-white/90" />
          </div>
        );
      case "media":
        return (
          <div className={cn(box, "relative h-full")}>
            <span className="absolute left-1/2 top-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90">
              <Play size={9} className="ml-0.5 fill-brand-600 text-brand-600" />
            </span>
          </div>
        );
      case "map":
        return (
          <div className="relative h-full rounded bg-emerald-500/15">
            <span className="absolute left-2 top-0 h-full w-1 bg-white/60" />
            <span className="absolute left-0 top-3 h-1 w-full bg-white/60" />
            <MapPin size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 fill-rose-500 text-white" />
          </div>
        );
      case "stat":
        return (
          <div className="grid h-full grid-cols-2 items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-1 rounded bg-brand-500/15 p-1">
                <div className="h-2 w-2/3 rounded bg-brand-500/60" />
                <div className="h-1 w-full rounded bg-brand-500/30" />
              </div>
            ))}
          </div>
        );
      case "divider":
        return (
          <div className="flex h-full items-center">
            <span className="h-px w-full bg-brand-500/40" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("relative h-[52px] w-full overflow-hidden rounded-lg bg-slate-100 p-2 dark:bg-zinc-800", className)}>
      {inner()}
    </div>
  );
}

export function BlockIcon({ type, size = 13 }: { type: string; size?: number }) {
  const Icon = BLOCK_ICONS[type] ?? ImageIcon;
  return <Icon size={size} />;
}
