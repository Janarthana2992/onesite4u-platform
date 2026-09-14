"use client";

import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  Download,
  ExternalLink,
  Facebook,
  FileText,
  Github,
  Globe,
  GraduationCap,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Play,
  Quote,
  Send,
  ShoppingBag,
  Twitter,
  Youtube,
} from "lucide-react";
import { Button, Card, Field, Input, SuccessState, Textarea, cn } from "@/components/ui";
import { useToast } from "@/components/providers";
import { useFakeSubmit } from "@/lib/hooks";
import { useScrollScope } from "@/components/design-store";
import { useProp } from "@/components/blocks/context";

export type BlockRenderProps = { wide: boolean; onBook: () => void };

type Item = Record<string, any>;
const useItems = () => useProp<Item[]>("items", []);

/* ---------------- Basics ---------------- */

const SOCIAL_ICONS: Record<string, typeof Globe> = {
  instagram: Instagram, linkedin: Linkedin, youtube: Youtube, x: Twitter, facebook: Facebook,
  whatsapp: MessageCircle, telegram: Send, website: Globe, github: Github, email: Mail,
};

function SocialsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const { toast } = useToast();
  return (
    <div className={cn("flex flex-wrap gap-2", wide ? "gap-3" : "")}>
      {items.map((it, i) => {
        const Icon = SOCIAL_ICONS[it.platform] ?? Globe;
        return (
          <button
            key={i}
            onClick={() => toast(`Opening ${it.platform}…`, "info")}
            className="os-card flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Icon size={16} />
            </span>
            <span className="max-w-[140px] truncate font-medium">{it.handle}</span>
          </button>
        );
      })}
    </div>
  );
}

function HoursBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const note = useProp("note", "");
  const today = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  return (
    <Card className={cn("p-2", wide && "p-3")}>
      <div className={cn(wide && "grid grid-cols-2 gap-2")}>
        {items.map((r, i) => {
          const isToday = String(r.day).toLowerCase().includes(today.slice(0, 3).toLowerCase());
          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm",
                isToday ? "bg-brand-50 dark:bg-brand-500/10" : "",
              )}
            >
              <span className={cn("font-medium", isToday && "text-brand-700 dark:text-brand-200")}>
                {r.day}
                {isToday && <span className="ml-2 text-[10px] font-bold uppercase text-brand-600">Today</span>}
              </span>
              <span className={cn("text-slate-600 dark:text-zinc-300", r.time === "Closed" && "text-rose-500")}>
                {r.time}
              </span>
            </div>
          );
        })}
      </div>
      {note && <p className="px-3 pb-1 pt-2 text-[11px] text-slate-400">{note}</p>}
    </Card>
  );
}

function MapBlock({ wide }: BlockRenderProps) {
  const address = useProp("address", "");
  const label = useProp("label", "");
  const { toast } = useToast();
  return (
    <Card className="overflow-hidden">
      <div className={cn("relative bg-[#e6efe3] dark:bg-zinc-800", wide ? "h-56" : "h-40")}>
        <svg className="absolute inset-0 h-full w-full text-white dark:text-zinc-700" viewBox="0 0 400 150" preserveAspectRatio="none">
          <g stroke="currentColor" fill="none" strokeLinecap="round">
            <path d="M0 40 C 80 30, 140 70, 400 55" strokeWidth="10" />
            <path d="M0 110 C 100 120, 200 90, 400 105" strokeWidth="8" />
            <path d="M90 0 C 100 60, 80 100, 95 150" strokeWidth="7" />
            <path d="M250 0 C 240 60, 270 100, 255 150" strokeWidth="7" />
          </g>
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-[60%] flex-col items-center">
          {label && (
            <span className="mb-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold shadow dark:bg-zinc-900">
              {label}
            </span>
          )}
          <MapPin size={34} className="fill-rose-500 text-white drop-shadow-lg" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <p className="text-sm text-slate-600 dark:text-zinc-300">{address}</p>
        <Button size="sm" variant="outline" onClick={() => toast("Opening in Google Maps…", "info")}>
          <Navigation size={13} /> Directions
        </Button>
      </div>
    </Card>
  );
}

function ContactFormBlock({ wide }: BlockRenderProps) {
  const askPhone = useProp("askPhone", true);
  const askSubject = useProp("askSubject", false);
  const buttonLabel = useProp("buttonLabel", "Send message");
  const { status, submit, reset } = useFakeSubmit(1200);
  return (
    <Card className="p-4">
      {status === "success" ? (
        <SuccessState title="Message sent" description="Thanks for reaching out. You will hear back soon.">
          <Button full variant="outline" onClick={reset}>Send another</Button>
        </SuccessState>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className={cn(wide ? "grid grid-cols-2 gap-3" : "space-y-3")}>
            <Field label="Name"><Input required placeholder="Your name" /></Field>
            <Field label="Email"><Input required type="email" placeholder="you@email.com" /></Field>
            {askPhone && <Field label="Phone"><Input type="tel" placeholder="+91 " /></Field>}
            {askSubject && <Field label="Subject"><Input placeholder="What is this about?" /></Field>}
          </div>
          <Field label="Message"><Textarea rows={4} required placeholder="How can I help?" /></Field>
          <Button type="submit" full size="lg" loading={status === "loading"}>
            {status === "loading" ? "Sending…" : <><Send size={16} /> {buttonLabel}</>}
          </Button>
        </form>
      )}
    </Card>
  );
}

/* ---------------- About ---------------- */

function TextBlock({ wide }: BlockRenderProps) {
  const body = useProp("body", "");
  const align = useProp<string>("align", "left");
  return (
    <Card className={cn("p-5", wide && "p-7")}>
      <div className={cn("space-y-3 text-[15px] leading-relaxed text-slate-700 dark:text-zinc-300", align === "center" && "text-center")}>
        {body.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Card>
  );
}

function HeadingBlock({ wide }: BlockRenderProps) {
  const text = useProp("text", "");
  const eyebrow = useProp("eyebrow", "");
  const size = useProp<string>("size", "lg");
  const align = useProp<string>("align", "left");
  const sizes: Record<string, string> = { md: "text-2xl", lg: wide ? "text-4xl" : "text-3xl", xl: wide ? "text-5xl" : "text-4xl" };
  return (
    <div className={cn(align === "center" && "text-center")}>
      {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{eyebrow}</p>}
      <h2 className={cn("font-bold tracking-tight", sizes[size] ?? sizes.lg)}>{text}</h2>
    </div>
  );
}

function ImageTextBlock({ wide }: BlockRenderProps) {
  const image = useProp("image", "");
  const heading = useProp("heading", "");
  const body = useProp("body", "");
  const side = useProp<string>("side", "left");
  return (
    <Card className={cn("overflow-hidden", wide && "flex", wide && side === "right" && "flex-row-reverse")}>
      <img src={image} alt="" className={cn("object-cover", wide ? "w-2/5 shrink-0" : "aspect-[4/3] w-full")} />
      <div className={cn("p-5", wide && "flex flex-1 flex-col justify-center p-7")}>
        {heading && <h3 className={cn("font-bold", wide ? "text-2xl" : "text-lg")}>{heading}</h3>}
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600 dark:text-zinc-400">{body}</p>
      </div>
    </Card>
  );
}

function QuoteBlock({ wide }: BlockRenderProps) {
  const text = useProp("text", "");
  const author = useProp("author", "");
  const role = useProp("role", "");
  return (
    <div className={cn("relative rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-xl shadow-brand-600/25", wide ? "p-8" : "p-5")}>
      <Quote size={wide ? 40 : 28} className="text-white/30" />
      <p className={cn("mt-2 font-head font-semibold leading-snug", wide ? "text-2xl" : "text-lg")}>{text}</p>
      {(author || role) && (
        <p className="mt-4 text-sm text-white/80">
          {author}{role && <span className="text-white/60"> · {role}</span>}
        </p>
      )}
    </div>
  );
}

function EducationBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-2")}>
      {items.map((it, i) => (
        <Card key={i} className="flex items-start gap-3 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <GraduationCap size={18} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{it.degree}</p>
            <p className="text-sm text-slate-500 dark:text-zinc-400">{it.school}</p>
            <p className="mt-0.5 text-xs text-slate-400">{[it.year, it.note].filter(Boolean).join(" · ")}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SkillsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const showLevels = useProp("showLevels", true);
  return (
    <Card className="p-4">
      <div className={cn("grid gap-3", wide ? "grid-cols-2" : "grid-cols-1")}>
        {items.map((it, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{it.name}</span>
              {showLevels && <span className="text-xs text-slate-400">{it.level}%</span>}
            </div>
            {showLevels && (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500" style={{ width: `${Math.min(100, Number(it.level) || 0)}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function AwardsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-2")}>
      {items.map((it, i) => (
        <Card key={i} className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <Award size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{it.title}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{it.issuer}</p>
          </div>
          <span className="text-sm font-bold text-slate-400">{it.year}</span>
        </Card>
      ))}
    </div>
  );
}

function CertificationsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-2")}>
      {items.map((it, i) => (
        <Card key={i} className="flex items-start gap-3 p-4">
          <BadgeCheck size={22} className="mt-0.5 shrink-0 fill-brand-500 text-white dark:text-zinc-900" />
          <div className="min-w-0">
            <p className="font-semibold">{it.name}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{[it.org, it.year].filter(Boolean).join(" · ")}</p>
            {it.ref && <p className="mt-1 font-mono text-[11px] text-slate-400">{it.ref}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}

function TeamBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide ? "grid-cols-4" : "grid-cols-2")}>
      {items.map((it, i) => (
        <Card key={i} className="flex flex-col items-center p-4 text-center">
          <img src={it.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <p className="mt-2 text-sm font-semibold">{it.name}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{it.role}</p>
        </Card>
      ))}
    </div>
  );
}

function StatsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide ? "grid-cols-4" : "grid-cols-2")}>
      {items.map((it, i) => (
        <Card key={i} className="p-4 text-center">
          <p className={cn("font-bold tracking-tight text-brand-600 dark:text-brand-300", wide ? "text-3xl" : "text-2xl")}>{it.value}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{it.label}</p>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Offerings ---------------- */

function PricingBlock({ wide, onBook }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-3 items-start")}>
      {items.map((p, i) => (
        <Card key={i} className={cn("flex flex-col p-5", p.highlight && "ring-2 ring-brand-500/60")}>
          {p.highlight && (
            <span className="mb-2 self-start rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Recommended
            </span>
          )}
          <p className="text-sm font-semibold text-slate-500 dark:text-zinc-400">{p.name}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{p.price}</p>
          <p className="text-xs text-slate-400">{p.period}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {String(p.features ?? "").split("\n").filter(Boolean).map((f: string, j: number) => (
              <li key={j} className="flex items-start gap-2">
                <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
              </li>
            ))}
          </ul>
          <Button full className="mt-5" variant={p.highlight ? "primary" : "outline"} onClick={onBook}>
            {p.cta || "Choose"}
          </Button>
        </Card>
      ))}
    </div>
  );
}

function ProductsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const { toast } = useToast();
  return (
    <div className={cn("grid gap-3", wide ? "grid-cols-4" : "grid-cols-2")}>
      {items.map((p, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative aspect-square bg-slate-100 dark:bg-zinc-800">
            <img src={p.image} alt="" className="h-full w-full object-cover" />
            {p.tag && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800">{p.tag}</span>}
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-semibold">{p.name}</p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-bold">{p.price}</span>
              <button onClick={() => toast(`${p.name} added to cart`)} className="rounded-lg bg-brand-50 p-1.5 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300" aria-label="Add to cart">
                <ShoppingBag size={15} />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MenuBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const groups = Array.from(new Set(items.map((i) => i.group || "Menu")));
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-2")}>
      {groups.map((g) => (
        <Card key={g} className="p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-300">{g}</p>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {items.filter((i) => (i.group || "Menu") === g).map((it, i) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{it.name}</p>
                  {it.description && <p className="text-xs text-slate-500 dark:text-zinc-400">{it.description}</p>}
                </div>
                <span className="shrink-0 text-sm font-bold">{it.price}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

function DownloadsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const { toast } = useToast();
  return (
    <div className={cn("grid gap-2.5", wide && "grid-cols-2")}>
      {items.map((f, i) => (
        <button key={i} onClick={() => toast(`Downloading ${f.title}…`, "info")} className="os-card flex w-full items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300"><FileText size={18} /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{f.title}</span>
            <span className="block text-xs text-slate-500 dark:text-zinc-400">{f.size}</span>
          </span>
          <Download size={16} className="text-slate-400" />
        </button>
      ))}
    </div>
  );
}

function ScheduleBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <Card className="p-4">
      <ol className="relative space-y-4 border-l border-slate-200 pl-5 dark:border-zinc-800">
        {items.map((s, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-white dark:ring-zinc-900" />
            <div className={cn(wide && "flex items-baseline gap-4")}>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-300"><Clock size={12} /> {s.time}</span>
              <p className="font-semibold">{s.title}</p>
              {s.note && <span className="text-xs text-slate-500 dark:text-zinc-400">{s.note}</span>}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ---------------- Media ---------------- */

function VideoBlock({ wide }: BlockRenderProps) {
  const thumbnail = useProp("thumbnail", "");
  const caption = useProp("caption", "");
  const duration = useProp("duration", "");
  const { toast } = useToast();
  return (
    <Card className="overflow-hidden">
      <button onClick={() => toast("Video player opens here (demo)", "info")} className="group relative block w-full">
        <img src={thumbnail} alt="" className={cn("w-full object-cover", wide ? "aspect-[21/9]" : "aspect-video")} />
        <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-xl transition-transform group-hover:scale-110">
          <Play size={26} className="ml-1 fill-current" />
        </span>
        {duration && <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">{duration}</span>}
      </button>
      {caption && <p className="p-3 text-sm text-slate-600 dark:text-zinc-300">{caption}</p>}
    </Card>
  );
}

function EmbedBlock({ wide }: BlockRenderProps) {
  const heading = useProp("heading", "");
  const description = useProp("description", "");
  const image = useProp("image", "");
  const source = useProp("source", "");
  const { toast } = useToast();
  return (
    <button onClick={() => toast(`Opening ${source}…`, "info")} className={cn("os-card block w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900", wide && "flex")}>
      <img src={image} alt="" className={cn("object-cover", wide ? "w-64 shrink-0" : "aspect-[16/9] w-full")} />
      <div className="p-4">
        <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-slate-400"><ExternalLink size={11} /> {source}</p>
        <p className="mt-1 font-semibold">{heading}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{description}</p>
      </div>
    </button>
  );
}

function AnnouncementsBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  return (
    <div className={cn("grid gap-3", wide && "grid-cols-3")}>
      {items.map((a, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{a.date}</span>
            {a.tag && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{a.tag}</span>}
          </div>
          <p className="mt-2 font-semibold">{a.title}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{a.body}</p>
        </Card>
      ))}
    </div>
  );
}

/* ---------------- Engage ---------------- */

function CtaBlock({ wide, onBook }: BlockRenderProps) {
  const heading = useProp("heading", "");
  const body = useProp("body", "");
  const buttonLabel = useProp("buttonLabel", "Get started");
  const action = useProp<string>("action", "book");
  const { scrollToId } = useScrollScope();
  const { toast } = useToast();
  const go = () => {
    if (action === "book") onBook();
    else if (action === "contact") scrollToId("contact");
    else toast("Opening link…", "info");
  };
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl dark:bg-white dark:text-slate-900", wide ? "flex items-center justify-between gap-8 p-8" : "p-6")}>
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/30 blur-2xl" />
      <div className="relative">
        <h3 className={cn("font-bold tracking-tight", wide ? "text-3xl" : "text-2xl")}>{heading}</h3>
        {body && <p className="mt-2 max-w-xl text-sm opacity-80">{body}</p>}
      </div>
      <Button size="lg" className={cn("relative shrink-0", !wide && "mt-5 w-full")} onClick={go}>
        {buttonLabel} <ArrowRight size={18} />
      </Button>
    </div>
  );
}

function PollBlock({ wide }: BlockRenderProps) {
  const question = useProp("question", "");
  const items = useItems();
  const [choice, setChoice] = useState<number | null>(null);
  const total = items.reduce((s, o) => s + (Number(o.votes) || 0), 0) + (choice !== null ? 1 : 0);
  return (
    <Card className={cn("p-4", wide && "p-6")}>
      <p className="font-semibold">{question}</p>
      <div className="mt-3 space-y-2">
        {items.map((o, i) => {
          const votes = (Number(o.votes) || 0) + (choice === i ? 1 : 0);
          const pct = total ? Math.round((votes / total) * 100) : 0;
          return (
            <button key={i} disabled={choice !== null} onClick={() => setChoice(i)} className={cn("relative w-full overflow-hidden rounded-xl border px-3 py-2.5 text-left text-sm transition-all", choice === null ? "border-slate-200 hover:border-brand-400 dark:border-zinc-700" : "border-transparent bg-slate-50 dark:bg-zinc-800/60")}>
              {choice !== null && <span className="absolute inset-y-0 left-0 bg-brand-100 transition-all duration-700 dark:bg-brand-500/20" style={{ width: `${pct}%` }} />}
              <span className="relative flex items-center justify-between">
                <span className={cn("font-medium", choice === i && "text-brand-700 dark:text-brand-200")}>{o.label}{choice === i && <Check size={14} className="ml-1 inline" />}</span>
                {choice !== null && <span className="text-xs font-bold">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">{total} votes{choice !== null ? " · thanks for voting" : ""}</p>
    </Card>
  );
}

function SupportBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const buttonLabel = useProp("buttonLabel", "Contribute");
  const [amount, setAmount] = useState<string>(items[1]?.value ?? items[0]?.value ?? "");
  const { status, submit, reset } = useFakeSubmit(1200);
  return (
    <Card className={cn("p-4", wide && "p-6")}>
      {status === "success" ? (
        <SuccessState title="Thank you!" description={`Your ${amount} contribution is recorded (demo — no payment was taken).`}>
          <Button full variant="outline" onClick={reset}>Done</Button>
        </SuccessState>
      ) : (
        <form onSubmit={submit}>
          <div className={cn("grid gap-2", wide ? "grid-cols-6" : "grid-cols-2")}>
            {items.map((a, i) => (
              <button type="button" key={i} onClick={() => setAmount(a.value)} className={cn("rounded-xl border py-2.5 text-sm font-semibold transition-all active:scale-95", amount === a.value ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200" : "border-slate-200 dark:border-zinc-700")}>
                {a.value}
              </button>
            ))}
          </div>
          <Button type="submit" full size="lg" className="mt-3" loading={status === "loading"}>
            {status === "loading" ? "Processing…" : <><Heart size={16} /> {buttonLabel} {amount}</>}
          </Button>
          <p className="mt-2 text-center text-[11px] text-slate-400">Demo · no real payment is processed</p>
        </form>
      )}
    </Card>
  );
}

function CountdownBlock({ wide }: BlockRenderProps) {
  const date = useProp("date", "");
  const label = useProp("label", "");
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = new Date(date).getTime();
  const diff = Math.max(0, (Number.isNaN(target) ? 0 : target) - now);
  const parts = [
    { v: Math.floor(diff / 86400000), l: "days" },
    { v: Math.floor((diff / 3600000) % 24), l: "hours" },
    { v: Math.floor((diff / 60000) % 60), l: "min" },
    { v: Math.floor((diff / 1000) % 60), l: "sec" },
  ];
  return (
    <div className={cn("rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-xl shadow-brand-600/25", wide ? "p-8" : "p-5")}>
      <div className={cn("grid grid-cols-4 gap-2", wide && "max-w-xl")}>
        {parts.map((p) => (
          <div key={p.l} className="rounded-2xl bg-white/15 py-3 text-center">
            <p className={cn("font-bold tabular-nums", wide ? "text-4xl" : "text-2xl")}>{String(p.v).padStart(2, "0")}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/70">{p.l}</p>
          </div>
        ))}
      </div>
      {label && <p className="mt-3 text-sm text-white/85">{label}</p>}
    </div>
  );
}

function FaqBlock({ wide }: BlockRenderProps) {
  const items = useItems();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Card className="divide-y divide-slate-100 dark:divide-zinc-800">
      {items.map((f, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)} className={cn("flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold", wide && "px-5")}>
            {f.q}
            <ChevronDown size={16} className={cn("shrink-0 text-slate-400 transition-transform", open === i && "rotate-180")} />
          </button>
          {open === i && <p className={cn("px-4 pb-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-400", wide && "px-5")}>{f.a}</p>}
        </div>
      ))}
    </Card>
  );
}

/* ---------------- Layout ---------------- */

function DividerBlock() {
  const style = useProp<string>("style", "line");
  const label = useProp("label", "");
  if (style === "space") return <div className="h-4" />;
  if (style === "dots") return <div className="flex justify-center gap-2 py-2">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />)}</div>;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
      {label && <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>}
      <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
    </div>
  );
}

export const SIMPLE_BLOCKS: Record<string, ComponentType<BlockRenderProps>> = {
  socials: SocialsBlock,
  hours: HoursBlock,
  map: MapBlock,
  contactForm: ContactFormBlock,
  text: TextBlock,
  heading: HeadingBlock,
  imageText: ImageTextBlock,
  quote: QuoteBlock,
  education: EducationBlock,
  skills: SkillsBlock,
  awards: AwardsBlock,
  certifications: CertificationsBlock,
  team: TeamBlock,
  stats: StatsBlock,
  pricing: PricingBlock,
  products: ProductsBlock,
  menu: MenuBlock,
  downloads: DownloadsBlock,
  schedule: ScheduleBlock,
  video: VideoBlock,
  embed: EmbedBlock,
  announcements: AnnouncementsBlock,
  cta: CtaBlock,
  poll: PollBlock,
  support: SupportBlock,
  countdown: CountdownBlock,
  faq: FaqBlock,
  divider: DividerBlock,
};
