"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Bot,
  Briefcase,
  Building2,
  CalendarDays,
  Camera,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FileUp,
  Gauge,
  GraduationCap,
  GripVertical,
  Images,
  Link2,
  Layers,
  ListChecks,
  Mail,
  MessageSquarePlus,
  MonitorSmartphone,
  Moon,
  MousePointerClick,
  Palette,
  PartyPopper,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Sun,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  bookings,
  stats,
  subscribers as subsData,
  weeklyViews,
  type LinkIcon,
} from "@/data/mock";
import { getDef } from "@/data/blocks";
import { profileLabel, profileUrl } from "@/lib/site";
import { blockHasContent } from "@/components/profile-view";
import { Button, Card, Field, Input, Sheet, Switch, Textarea, cn } from "@/components/ui";
import { LinkIconBadge } from "@/components/profile-sections";
import { Customizer } from "@/components/customizer";
import { LiveEditor } from "@/components/live-editor";
import { BlockManager } from "@/components/block-manager";
import { EXAMPLE_PROFILES } from "@/data/profiles";
import { useContent, type ListKey } from "@/components/content-store";
import { useDesign } from "@/components/design-store";
import { useTheme, useToast } from "@/components/providers";
import { useFakeSubmit, useMediaQuery } from "@/lib/hooks";
import { answerQuestion } from "@/lib/rag";
import { ACCOUNT_SUGGESTIONS, askAccount, type AccountAnswer, type AccountFacts } from "@/lib/account-ai";
import { ingestFile } from "@/lib/ingest";

/* ---------------- config ---------------- */

type Row = { id: string } & Record<string, any>;

type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "url" | "textarea" | "select";
  options?: string[];
  required?: boolean;
};

type ListConfig = {
  key: ListKey;
  title: string;
  subtitle: string;
  cta: string;
  noun: string;
  fields: FieldDef[];
  lead?: (row: Row) => ReactNode;
  primary: (row: Row) => string;
  secondary: (row: Row) => string;
  meta?: (row: Row) => ReactNode;
  toggle?: { field: string; label: string };
  columns?: number;
};

const LINK_ICONS: LinkIcon[] = ["portfolio", "linkedin", "payment", "youtube", "brochure", "instagram"];

const plural = (noun: string) => (noun.endsWith("y") ? `${noun.slice(0, -1)}ies` : `${noun}s`);

const monogram = (text: string) =>
  text
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const Mono = ({ text }: { text: string }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-xs font-bold text-white">
    {text}
  </span>
);

const Chip = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
    {children}
  </span>
);

const LISTS: Record<string, ListConfig> = {
  links: {
    key: "links",
    title: "Links",
    subtitle: "Buttons shown on the public profile",
    cta: "Add link",
    noun: "link",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "subtitle", label: "Subtitle" },
      { key: "url", label: "URL", type: "url" },
      { key: "icon", label: "Icon", type: "select", options: LINK_ICONS },
    ],
    lead: (r) => <LinkIconBadge icon={(r.icon ?? "portfolio") as LinkIcon} className="h-10 w-10" />,
    primary: (r) => r.title || "Untitled link",
    secondary: (r) => r.subtitle || r.url || "",
    meta: (r) => (
      <Chip>
        <MousePointerClick size={11} /> {r.clicks ?? 0} clicks
      </Chip>
    ),
    toggle: { field: "visible", label: "Visible" },
  },
  services: {
    key: "services",
    title: "Services",
    subtitle: "Bookable offerings and pricing",
    cta: "Add service",
    noun: "service",
    fields: [
      { key: "name", label: "Service name", required: true },
      { key: "price", label: "Price (₹)", type: "number" },
      { key: "duration", label: "Duration" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    lead: (r) => <Mono text={monogram(r.name || "S")} />,
    primary: (r) => r.name || "Untitled service",
    secondary: (r) => r.description || "",
    meta: (r) => (
      <>
        <Chip>
          <span className="font-bold text-slate-900 dark:text-white">
            ₹{Number(r.price ?? 0).toLocaleString("en-IN")}
          </span>
        </Chip>
        <Chip>{r.duration}</Chip>
        <Chip>
          <CalendarDays size={11} /> {r.bookings ?? 0} bookings
        </Chip>
      </>
    ),
  },
  experience: {
    key: "experience",
    title: "Experience",
    subtitle: "Career timeline on the profile",
    cta: "Add role",
    noun: "role",
    fields: [
      { key: "role", label: "Role", required: true },
      { key: "company", label: "Company" },
      { key: "period", label: "Period", type: "text" },
      { key: "location", label: "Location" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    lead: (r) => <Mono text={monogram(r.company || r.role || "E")} />,
    primary: (r) => r.role || "Untitled role",
    secondary: (r) => [r.company, r.period].filter(Boolean).join(" · "),
    meta: (r) => (r.location ? <Chip>{r.location}</Chip> : null),
  },
  reviews: {
    key: "reviews",
    title: "Reviews",
    subtitle: "Client testimonials",
    cta: "Add review",
    noun: "review",
    fields: [
      { key: "author", label: "Client name", required: true },
      { key: "role", label: "Role / company" },
      { key: "rating", label: "Rating (1–5)", type: "number" },
      { key: "text", label: "Review", type: "textarea" },
      { key: "date", label: "Date" },
      { key: "avatar", label: "Photo URL", type: "url" },
    ],
    lead: (r) =>
      r.avatar ? (
        <img src={r.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <Mono text={monogram(r.author || "R")} />
      ),
    primary: (r) => r.author || "Unnamed client",
    secondary: (r) => r.text || "",
    meta: (r) => (
      <>
        <Chip>
          <Star size={11} className="fill-amber-400 text-amber-400" /> {r.rating ?? 0}
        </Chip>
        <Chip>{r.date}</Chip>
      </>
    ),
  },
  clients: {
    key: "clients",
    title: "Clients",
    subtitle: "Logo wall on the profile",
    cta: "Add client",
    noun: "client",
    fields: [
      { key: "name", label: "Company name", required: true },
      { key: "initials", label: "Monogram" },
      { key: "industry", label: "Industry" },
      { key: "since", label: "Client since" },
    ],
    lead: (r) => <Mono text={r.initials || monogram(r.name || "C")} />,
    primary: (r) => r.name || "Untitled client",
    secondary: (r) => r.industry || "",
    meta: (r) => (r.since ? <Chip>Since {r.since}</Chip> : null),
    columns: 2,
  },
  gallery: {
    key: "gallery",
    title: "Gallery",
    subtitle: "Photos shown in the media grid",
    cta: "Add photo",
    noun: "photo",
    fields: [
      { key: "caption", label: "Caption", required: true },
      { key: "src", label: "Image URL", type: "url" },
    ],
    lead: (r) => <img src={r.src} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />,
    primary: (r) => r.caption || "Untitled photo",
    secondary: (r) => r.src || "",
    columns: 2,
  },
  events: {
    key: "events",
    title: "Events",
    subtitle: "Workshops and meetups with RSVP",
    cta: "Add event",
    noun: "event",
    fields: [
      { key: "title", label: "Event title", required: true },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "venue", label: "Venue" },
      { key: "description", label: "Description", type: "textarea" },
    ],
    lead: (r) => (
      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800">
        <span className="text-[9px] font-bold uppercase text-rose-500">{r.month}</span>
        <span className="text-sm font-bold leading-none">{r.day}</span>
      </span>
    ),
    primary: (r) => r.title || "Untitled event",
    secondary: (r) => [r.time, r.venue].filter(Boolean).join(" · "),
    meta: (r) => (
      <Chip>
        <Users size={11} /> {r.attendees ?? 0} RSVPs
      </Chip>
    ),
  },
  jobs: {
    key: "jobs",
    title: "Jobs",
    subtitle: "Open roles and applications",
    cta: "Post a job",
    noun: "job",
    fields: [
      { key: "title", label: "Job title", required: true },
      { key: "type", label: "Employment type" },
      { key: "location", label: "Location" },
      { key: "pay", label: "Compensation" },
    ],
    lead: () => (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
        <Building2 size={18} />
      </span>
    ),
    primary: (r) => r.title || "Untitled role",
    secondary: (r) => [r.location, r.type].filter(Boolean).join(" · "),
    meta: (r) => (
      <>
        <Chip>
          <span className="font-semibold text-slate-900 dark:text-white">{r.pay}</span>
        </Chip>
        <Chip>
          <Users size={11} /> {r.applicants ?? 0} applicants
        </Chip>
      </>
    ),
    toggle: { field: "open", label: "Accepting applications" },
  },
  milestones: {
    key: "milestones",
    title: "Progress tracker",
    subtitle: "Promises, roadmap or track record",
    cta: "Add item",
    noun: "item",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["done", "progress", "planned"] },
      { key: "progress", label: "Progress (0–100)", type: "number" },
      { key: "meta", label: "Note (budget, date, owner)" },
    ],
    lead: (r) => (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
        {Number(r.progress ?? 0)}%
      </span>
    ),
    primary: (r) => r.title || "Untitled item",
    secondary: (r) => r.description || "",
    meta: (r) => (
      <>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            r.status === "done"
              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              : r.status === "progress"
                ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400",
          )}
        >
          {r.status === "done" ? "Delivered" : r.status === "progress" ? "In progress" : "Planned"}
        </span>
        {r.meta ? <Chip>{r.meta}</Chip> : null}
      </>
    ),
  },
  knowledge: {
    key: "knowledge",
    title: "Knowledge base",
    subtitle: "What the AI assistant is allowed to answer from",
    cta: "Add entry",
    noun: "entry",
    fields: [
      { key: "title", label: "Title", required: true },
      { key: "content", label: "Content", type: "textarea" },
      { key: "tags", label: "Tags (comma separated)" },
    ],
    lead: () => (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
        <Sparkles size={18} />
      </span>
    ),
    primary: (r) => r.title || "Untitled entry",
    secondary: (r) => r.content || "",
    meta: (r) => (
      <>
        {(r.tags ?? []).slice(0, 4).map((t: string) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {t}
          </span>
        ))}
      </>
    ),
  },
};

type TabId =
  | "overview"
  | "profile"
  | "links"
  | "services"
  | "appointments"
  | "experience"
  | "reviews"
  | "clients"
  | "gallery"
  | "events"
  | "jobs"
  | "milestones"
  | "requests"
  | "subscribers"
  | "ai"
  | "insights"
  | "live"
  | "design"
  | "examples";

type TabDef = {
  id: TabId;
  label: string;
  icon: typeof User;
  group: string;
  /**
   * The block that unlocks this tab. A tab only appears once that block is on
   * the page, so the dashboard never shows tools for features you do not use.
   */
  requires?: string;
  /** Shown in the "not unlocked yet" list. */
  unlock?: string;
};

const TABS: TabDef[] = [
  { id: "overview", label: "Overview", icon: Gauge, group: "Account" },
  { id: "profile", label: "Profile", icon: User, group: "Account" },
  { id: "insights", label: "Ask about my account", icon: Bot, group: "Account" },
  { id: "live", label: "Live editor", icon: MonitorSmartphone, group: "Account" },
  { id: "design", label: "Design & blocks", icon: Palette, group: "Account" },
  { id: "examples", label: "Example profiles", icon: Layers, group: "Account" },

  { id: "links", label: "Links", icon: Link2, group: "Page content", requires: "links", unlock: "Link buttons" },
  { id: "services", label: "Services", icon: Briefcase, group: "Page content", requires: "services", unlock: "Services" },
  { id: "experience", label: "Experience", icon: GraduationCap, group: "Page content", requires: "experience", unlock: "Experience" },
  { id: "reviews", label: "Reviews", icon: Star, group: "Page content", requires: "reviews", unlock: "Reviews" },
  { id: "clients", label: "Clients", icon: Building2, group: "Page content", requires: "clients", unlock: "Logo wall" },
  { id: "milestones", label: "Progress", icon: ListChecks, group: "Page content", requires: "milestones", unlock: "Progress tracker" },
  { id: "gallery", label: "Gallery", icon: Images, group: "Page content", requires: "gallery", unlock: "Photo gallery" },
  { id: "events", label: "Events", icon: PartyPopper, group: "Page content", requires: "event", unlock: "Event" },
  { id: "jobs", label: "Jobs", icon: Users, group: "Page content", requires: "jobs", unlock: "Openings" },

  { id: "appointments", label: "Appointments", icon: CalendarDays, group: "Incoming", requires: "services", unlock: "Services" },
  { id: "requests", label: "Requests", icon: MessageSquarePlus, group: "Incoming", requires: "grievance", unlock: "Request desk" },
  { id: "subscribers", label: "Subscribers", icon: Mail, group: "Incoming", requires: "newsletter", unlock: "Newsletter" },
  { id: "ai", label: "Knowledge base", icon: Sparkles, group: "Incoming", requires: "assistant", unlock: "AI assistant" },
];

const GROUPS = ["Account", "Page content", "Incoming"];

/* ---------------- shell ---------------- */

export function AdminView({ framed = false }: { framed?: boolean }) {
  const { toast } = useToast();
  const { theme, toggle } = useTheme();
  const { content } = useContent();
  const { design } = useDesign();
  const [tab, setTab] = useState<TabId>("overview");
  const [editor, setEditor] = useState<{ key: ListKey; row: Row | null } | null>(null);
  const isDesktopViewport = useMediaQuery("(min-width: 1024px)");
  const wide = !framed && isDesktopViewport;

  const openEditor = (key: ListKey, row: Row | null) => setEditor({ key, row });

  // A tab exists only when the block that feeds it is on the page.
  const onPage = new Set(design.blocks.map((b) => b.type));
  const tabs = TABS.filter((t) => !t.requires || onPage.has(t.requires));
  const locked = TABS.filter((t) => t.requires && !onPage.has(t.requires));
  const active = tabs.some((t) => t.id === tab) ? tab : "overview";

  const body = (
    <>
      {active === "overview" && <OverviewTab wide={wide} locked={locked} />}
      {active === "profile" && <ProfileTab wide={wide} />}
      {active === "insights" && <InsightsTab wide={wide} />}
      {active === "subscribers" && <SubscribersTab wide={wide} />}
      {active === "requests" && <RequestsTab wide={wide} />}
      {active === "appointments" && <BookingsPanel wide={wide} />}
      {active === "ai" && <AiTab wide={wide} onEdit={openEditor} />}
      {active === "live" && (
        <>
          <PageHeader title="Live editor" subtitle="Arrange the page and edit it on the preview" wide={wide} />
          <LiveEditor />
        </>
      )}
      {active === "design" && <DesignTab wide={wide} />}
      {active === "examples" && <ExamplesTab wide={wide} />}
      {["links", "services", "experience", "reviews", "clients", "gallery", "jobs", "milestones", "events"].includes(active) && (
        <ListTab config={LISTS[active === "events" ? "events" : active]} wide={wide} onEdit={openEditor} />
      )}
    </>
  );

  const sheets = (
    <EditorSheet editor={editor} onClose={() => setEditor(null)} />
  );

  const brand = (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white">
        <Sparkles size={17} />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
          OneSite4U
        </p>
        <p className="text-sm font-bold">Admin dashboard</p>
      </div>
    </div>
  );

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800";

  /* ----- desktop ----- */
  if (wide) {
    return (
      <div className="min-h-dvh bg-slate-100 dark:bg-zinc-950">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
            {brand}
            <div className="ml-auto flex items-center gap-1.5">
              <button onClick={toggle} aria-label="Toggle dark mode" className={iconBtn}>
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => toast("3 new notifications", "info")}
                aria-label="Notifications"
                className={cn(iconBtn, "relative")}
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
              </button>
              <Link
                href="/me"
                className="ml-1 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <ExternalLink size={13} /> View live site
              </Link>
              <img src={content.profile.avatar} alt="" className="ml-1 h-9 w-9 rounded-full object-cover" />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl grid-cols-[232px_minmax(0,1fr)] gap-6 px-6 py-6">
          <aside className="sticky top-[88px] self-start">
            <nav className="space-y-4">
              {GROUPS.map((group) => {
                const items = tabs.filter((t) => t.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {group}
                    </p>
                    <div className="space-y-0.5">
                      {items.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setTab(id)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                            active === id
                              ? "bg-white text-brand-700 shadow-sm dark:bg-zinc-900 dark:text-brand-300"
                              : "text-slate-600 hover:bg-white/70 dark:text-zinc-400 dark:hover:bg-zinc-900/60",
                          )}
                        >
                          <Icon size={16} /> {label}
                          {active === id && <ChevronRight size={14} className="ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {locked.length > 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-zinc-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Not on your page</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    {locked.map((t) => t.label).join(", ")} appear here once you add the matching block.
                  </p>
                  <Link href="/webview" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-300">
                    <Plus size={12} /> Add blocks
                  </Link>
                </div>
              )}
            </nav>
          </aside>

          <main className="min-w-0 space-y-6">{body}</main>
        </div>
        {sheets}
      </div>
    );
  }

  /* ----- mobile ----- */
  return (
    <div
      className={cn(
        "mx-auto max-w-md bg-slate-50 pb-10 dark:bg-zinc-950",
        framed ? "min-h-full" : "min-h-dvh shadow-2xl",
      )}
    >
      <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" aria-label="Back to profile" className={iconBtn}>
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              OneSite4U Admin
            </p>
            <h1 className="truncate text-base font-bold leading-tight">Dashboard</h1>
          </div>
          <button onClick={toggle} aria-label="Toggle dark mode" className={iconBtn}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => toast("3 new notifications", "info")}
            aria-label="Notifications"
            className={cn(iconBtn, "relative")}
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
          </button>
          <img src={content.profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                active === id
                  ? "bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-md shadow-brand-600/30"
                  : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
              )}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <main className="space-y-5 px-4 pt-4">{body}</main>
      {sheets}
    </div>
  );
}

/* ---------------- stats ---------------- */

function StatsGrid({ wide }: { wide: boolean }) {
  const tiles = [
    { icon: Eye, label: "Profile views", value: stats.views, delta: "+12%", color: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" },
    { icon: MousePointerClick, label: "Link clicks", value: stats.clicks, delta: "+8%", color: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
    { icon: CalendarDays, label: "Bookings", value: stats.bookings, delta: "+3", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
    { icon: Users, label: "Subscribers", value: stats.subscribers, delta: "+15%", color: "bg-pink-50 text-pink-600 dark:bg-pink-500/15 dark:text-pink-300" },
  ];
  return (
    <div className={cn("grid gap-3", wide ? "grid-cols-4 gap-4" : "grid-cols-2")}>
      {tiles.map(({ icon: Icon, label, value, delta, color }) => (
        <Card key={label} className="p-4">
          <div className="flex items-center justify-between">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", color)}>
              <Icon size={18} />
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <TrendingUp size={11} /> {delta}
            </span>
          </div>
          <p className={cn("mt-3 font-bold tracking-tight", wide ? "text-3xl" : "text-2xl")}>
            {value.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">{label}</p>
        </Card>
      ))}
    </div>
  );
}

function ViewsChart({ wide }: { wide: boolean }) {
  const max = Math.max(...weeklyViews.map((v) => v.value));
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Profile views</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Last 7 days</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{stats.views.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-emerald-600">↑ 12% vs last week</p>
        </div>
      </div>
      <div className={cn("mt-4 flex items-end gap-2", wide ? "h-44" : "h-28")}>
        {weeklyViews.map((v, i) => (
          <div key={v.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] font-semibold text-slate-400">{v.value}</span>
            <div
              className={cn(
                "w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-accent-400 transition-all",
                i === weeklyViews.length - 1 && "from-accent-600 to-accent-400",
              )}
              style={{ height: `${(v.value / max) * 80}%` }}
            />
            <span className="text-[10px] text-slate-400">{v.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------------- profile tab ---------------- */

/** Account numbers and page health, separate from the profile form. */
function OverviewTab({ wide, locked }: { wide: boolean; locked: TabDef[] }) {
  return (
    <>
      <PageHeader title="Overview" subtitle="How your page is performing" wide={wide} />
      <StatsGrid wide={wide} />
      <ViewsChart wide={wide} />
      <SectionHealth wide={wide} />
      {locked.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-semibold">Tools you have not enabled</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Each of these appears in the sidebar the moment you add its block to the page.
          </p>
          <div className={cn("mt-3 grid gap-2", wide ? "grid-cols-3" : "grid-cols-1")}>
            {locked.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-2 dark:border-zinc-800">
                <t.icon size={15} className="shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{t.label}</p>
                  <p className="truncate text-[10px] text-slate-400">Add the “{t.unlock}” block</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/webview" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
            <Plus size={13} /> Open the page editor
          </Link>
        </Card>
      )}
    </>
  );
}

function ProfileTab({ wide }: { wide: boolean }) {
  const { toast } = useToast();
  const { content, updateProfile } = useContent();
  const { profile } = content;
  const { status, submit } = useFakeSubmit(900);

  const onSubmit = async (e: FormEvent) => {
    await submit(e);
    toast("Profile updated · live on your site");
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Your identity, contact details and page settings" wide={wide} />
      <form onSubmit={onSubmit} className={cn("gap-4", wide ? "grid grid-cols-2 items-start" : "space-y-4")}>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img src={profile.avatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                <button
                  type="button"
                  onClick={() => toast("Photo picker opened", "info")}
                  aria-label="Change photo"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white dark:ring-zinc-900"
                >
                  <Camera size={13} />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{profile.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                  {profileLabel(profile.handle)}
                </p>
                <div className="mt-1.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(profileUrl(profile.handle)).catch(() => {});
                      toast("Link copied");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium dark:bg-zinc-800"
                  >
                    <Copy size={11} /> Copy link
                  </button>
                  <Link
                    href="/me"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium dark:bg-zinc-800"
                  >
                    <ExternalLink size={11} /> View live
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold">Identity</p>
            <Field label="Full name">
              <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
            </Field>
            <Field label="Title">
              <Input value={profile.title} onChange={(e) => updateProfile({ title: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <Textarea
                rows={2}
                value={profile.tagline}
                onChange={(e) => updateProfile({ tagline: e.target.value })}
              />
            </Field>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold">Contact</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone">
                <Input value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} />
              </Field>
            </div>
            <Field label="Website">
              <Input value={profile.website} onChange={(e) => updateProfile({ website: e.target.value })} />
            </Field>
            <Field label="Location" hint="Clearing every contact field hides Quick Info on the site.">
              <Input value={profile.location} onChange={(e) => updateProfile({ location: e.target.value })} />
            </Field>
          </Card>

          <Card className="p-4">
            <p className="text-sm font-semibold">Page settings</p>
            <SettingRow label="Show 'Available' badge" desc="Green dot on your profile photo" />
            <SettingRow label="Accept appointments" desc="Visitors can book time slots" />
            <SettingRow label="Newsletter signup" desc="Collect subscriber emails" />
          </Card>

          <Button type="submit" full size="lg" loading={status === "loading"}>
            {status === "loading" ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </>
  );
}

/* ---------------- requests / grievance desk ---------------- */

function RequestsTab({ wide }: { wide: boolean }) {
  const { content, updateGrievance } = useContent();
  const { grievance, requests } = content;
  const { toast } = useToast();
  const [filter, setFilter] = useState("All");

  const statusCls: Record<string, string> = {
    Open: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300",
    "In progress": "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    Resolved: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  };
  const statuses = ["All", "Open", "In progress", "Resolved"];
  const list = filter === "All" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className={cn("gap-6", wide ? "grid grid-cols-[minmax(0,1fr)_360px] items-start" : "space-y-5")}>
      <div className="space-y-4">
        <PageHeader
          title="Requests"
          subtitle={`${requests.filter((r) => r.status !== "Resolved").length} open · ${requests.length} total`}
          wide={wide}
          action={
            <Button size={wide ? "md" : "sm"} variant="outline" onClick={() => toast("Exported as CSV")}>
              <Download size={14} /> Export
            </Button>
          }
        />
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
              )}
            >
              {st}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <Card className="px-6 py-10 text-center text-sm text-slate-400">No requests here.</Card>
        ) : (
          <div className={cn("grid gap-2.5", wide && "grid-cols-2")}>
            {list.map((r) => (
              <Card key={r.id} className="p-3">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {monogram(r.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{r.name}</p>
                      <span className="shrink-0 font-mono text-[10px] text-slate-400">{r.ref}</span>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">{r.summary}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Chip>{r.category}</Chip>
                      {r.location !== "—" && <Chip>{r.location}</Chip>}
                      <Chip>{r.date}</Chip>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      statusCls[r.status],
                    )}
                  >
                    {r.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Request desk</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Show the intake form on your page</p>
          </div>
          <Switch
            checked={grievance.enabled}
            onChange={(v) => updateGrievance({ enabled: v })}
            label="Enable request desk"
          />
        </div>
        <Field label="Response promise">
          <Input value={grievance.sla} onChange={(e) => updateGrievance({ sla: e.target.value })} />
        </Field>
        <Field label="Categories" hint="One per line">
          <Textarea
            rows={6}
            value={grievance.categories.join("\n")}
            onChange={(e) =>
              updateGrievance({ categories: e.target.value.split("\n").filter((l) => l.trim()) })
            }
          />
        </Field>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ask for a location</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Ward, street or branch</p>
          </div>
          <Switch
            checked={grievance.askLocation}
            onChange={(v) => updateGrievance({ askLocation: v })}
            label="Ask for a location"
          />
        </div>
        {grievance.askLocation && (
          <Field label="Location field label">
            <Input
              value={grievance.locationLabel}
              onChange={(e) => updateGrievance({ locationLabel: e.target.value })}
            />
          </Field>
        )}
        <Field label="Safety note shown under the form">
          <Textarea
            rows={3}
            value={grievance.note}
            onChange={(e) => updateGrievance({ note: e.target.value })}
          />
        </Field>
      </Card>
    </div>
  );
}

function SettingRow({ label, desc }: { label: string; desc: string }) {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-3 first-of-type:border-0 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{desc}</p>
      </div>
      <Switch checked={on} onChange={setOn} label={label} />
    </div>
  );
}

/** Shows which blocks currently reach the public page and why. */
function SectionHealth({ wide }: { wide: boolean }) {
  const { content } = useContent();
  const { design } = useDesign();

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Blocks on your page</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Empty blocks are skipped automatically, even when switched on.
          </p>
        </div>
        <Link href="/webview" className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold dark:bg-zinc-800">
          <ExternalLink size={11} /> Open editor
        </Link>
      </div>
      <div className={cn("mt-3 grid gap-2", wide ? "grid-cols-3" : "grid-cols-1")}>
        {design.blocks.map((b) => {
          const def = getDef(b.type);
          if (!def) return null;
          const filled = blockHasContent(b, content);
          const live = b.visible && filled;
          const name = String(b.props.title || b.props.heading || def.label);
          return (
            <div key={b.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-zinc-800">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", live ? "bg-emerald-500" : "bg-slate-300 dark:bg-zinc-700")} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{name}</p>
                <p className="truncate text-[10px] text-slate-400">
                  {!b.visible ? "Hidden" : !filled ? "Empty · add content to show it" : def.label}
                </p>
              </div>
              {live ? <Eye size={13} className="shrink-0 text-emerald-500" /> : <EyeOff size={13} className="shrink-0 text-slate-300 dark:text-zinc-600" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- generic list tab ---------------- */

function PageHeader({
  title,
  subtitle,
  wide,
  action,
}: {
  title: string;
  subtitle: string;
  wide: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className={cn("font-bold tracking-tight", wide ? "text-2xl" : "text-lg")}>{title}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function RowActions({ onEdit, onRemove }: { onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        onClick={onEdit}
        aria-label="Edit"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={onRemove}
        aria-label="Delete"
        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/10"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function ListTab({
  config,
  wide,
  onEdit,
}: {
  config: ListConfig;
  wide: boolean;
  onEdit: (key: ListKey, row: Row | null) => void;
}) {
  const { content, patch, remove } = useContent();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const rows = content[config.key] as unknown as Row[];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${config.primary(r)} ${config.secondary(r)}`.toLowerCase().includes(q),
    );
  }, [rows, query, config]);

  const columns = wide ? (config.columns ?? 1) * 2 : 1;

  return (
    <>
      <PageHeader
        title={config.title}
        subtitle={`${rows.length} item${rows.length === 1 ? "" : "s"} · ${config.subtitle}`}
        wide={wide}
        action={
          <Button size={wide ? "md" : "sm"} onClick={() => onEdit(config.key, null)}>
            <Plus size={14} /> {config.cta}
          </Button>
        }
      />

      {rows.length > 4 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${plural(config.noun)}`}
            className="pl-9"
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          noun={config.noun}
          cta={config.cta}
          onAdd={() => onEdit(config.key, null)}
          searching={query.length > 0}
        />
      ) : (
        <div className={cn("grid gap-2.5", columns === 2 && "grid-cols-2", columns === 4 && "grid-cols-3")}>
          {filtered.map((row) => {
            const toggled = config.toggle ? Boolean(row[config.toggle.field]) : true;
            return (
              <Card key={row.id} className={cn("flex items-start gap-2.5 p-3", !toggled && "opacity-60")}>
                {!wide && config.toggle && (
                  <GripVertical size={16} className="mt-2.5 shrink-0 cursor-grab text-slate-300 dark:text-zinc-600" />
                )}
                {config.lead?.(row)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{config.primary(row)}</p>
                  <p className="line-clamp-2 text-xs text-slate-500 dark:text-zinc-400">
                    {config.secondary(row)}
                  </p>
                  {config.meta && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">{config.meta(row)}</div>
                  )}
                </div>
                {config.toggle && (
                  <Switch
                    checked={toggled}
                    onChange={(v) => patch(config.key, row.id, { [config.toggle!.field]: v })}
                    label={config.toggle.label}
                  />
                )}
                <RowActions
                  onEdit={() => onEdit(config.key, row)}
                  onRemove={() => {
                    remove(config.key, row.id);
                    toast(`${config.noun} removed`, "info");
                  }}
                />
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

function EmptyState({
  noun,
  cta,
  onAdd,
  searching,
}: {
  noun: string;
  cta: string;
  onAdd: () => void;
  searching: boolean;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800">
        <EyeOff size={22} />
      </span>
      <div>
        <p className="text-sm font-semibold">
          {searching ? `No ${plural(noun)} match your search` : `No ${plural(noun)} yet`}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          {searching
            ? "Try a different term."
            : `This section is hidden on your public page until you add a ${noun}.`}
        </p>
      </div>
      {!searching && (
        <Button size="sm" onClick={onAdd}>
          <Plus size={14} /> {cta}
        </Button>
      )}
    </Card>
  );
}

/* ---------------- bookings ---------------- */

function BookingsPanel({ wide }: { wide: boolean }) {
  const statusCls: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    Pending: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    Completed: "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400",
  };
  return (
    <>
      <PageHeader
        title="Upcoming appointments"
        subtitle={`${stats.bookings} bookings this month`}
        wide={wide}
      />
      <Card className="divide-y divide-slate-100 dark:divide-zinc-800">
        {bookings.map((b) => (
          <div key={b.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-600 text-xs font-bold text-white">
              {monogram(b.client)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{b.client}</p>
              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                {b.service} · {b.date}, {b.time}
              </p>
            </div>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", statusCls[b.status])}>
              {b.status}
            </span>
          </div>
        ))}
      </Card>
    </>
  );
}

/* ---------------- subscribers ---------------- */

function SubscribersTab({ wide }: { wide: boolean }) {
  const { toast } = useToast();
  const [q, setQ] = useState("");
  const list = useMemo(
    () =>
      subsData.filter(
        (s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase()),
      ),
    [q],
  );
  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle={`${stats.subscribers} total · +12 this week`}
        wide={wide}
        action={
          <Button
            size={wide ? "md" : "sm"}
            variant="outline"
            onClick={() => toast(`Exported ${stats.subscribers} subscribers as CSV`)}
          >
            <Download size={14} /> Export CSV
          </Button>
        }
      />
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="pl-9" />
      </div>
      <Card className="divide-y divide-slate-100 dark:divide-zinc-800">
        {list.map((s) => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              {monogram(s.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{s.email}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400">{s.date}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                {s.source}
              </span>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">No subscribers match “{q}”</p>}
      </Card>
    </>
  );
}

/* ---------------- private account assistant ---------------- */

type Turn = { id: number; q: string; a: AccountAnswer };

function InsightsTab({ wide }: { wide: boolean }) {
  const { content } = useContent();
  const { design } = useDesign();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const facts: AccountFacts = {
    views: stats.views,
    clicks: stats.clicks,
    bookings: stats.bookings,
    subscribers: stats.subscribers,
    weekly: weeklyViews,
    links: content.links.map((l) => ({ title: l.title, clicks: l.clicks, visible: l.visible })),
    services: content.services.map((x) => ({ name: x.name, price: x.price, bookings: x.bookings })),
    requests: content.requests.map((r) => ({ status: r.status, category: r.category })),
    reviews: content.reviews.map((r) => ({ rating: r.rating })),
    jobs: content.jobs.map((j) => ({ title: j.title, applicants: j.applicants, open: j.open })),
    events: content.events.map((e) => ({ title: e.title, attendees: e.attendees })),
    knowledgeCount: content.knowledge.length,
    blocks: design.blocks.map((b) => ({
      label: String(b.props.title || getDef(b.type)?.label || b.type),
      live: b.visible && blockHasContent(b, content),
    })),
  };

  const ask = (q: string) => {
    const question = q.trim();
    if (!question || thinking) return;
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setTurns((t) => [...t, { id: Date.now(), q: question, a: askAccount(question, facts) }]);
      setThinking(false);
    }, 550);
  };

  return (
    <>
      <PageHeader title="Ask about my account" subtitle="Private to you — never shown on your public page" wide={wide} />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-900 p-4 text-white dark:border-zinc-800 dark:bg-zinc-800">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15"><Bot size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Account assistant</p>
            <p className="text-[11px] text-white/70">Reads your live analytics, content and page setup</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold uppercase">
            <Eye size={11} /> Owner only
          </span>
        </div>

        <div className={cn("space-y-4 overflow-y-auto p-4", turns.length ? "max-h-[28rem]" : "")}>
          {turns.length === 0 && !thinking && (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Ask anything about how your page is doing. I answer from your own numbers, so nothing here
              leaves your account.
            </p>
          )}
          {turns.map((t) => (
            <div key={t.id} className="space-y-2">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">{t.q}</p>
              </div>
              <div className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-zinc-700"><Bot size={14} /></span>
                <div className="min-w-0 flex-1">
                  <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed dark:bg-zinc-800">{t.a.text}</p>
                  {t.a.chips.length > 0 && (
                    <div className={cn("mt-2 grid gap-2", wide ? "grid-cols-4" : "grid-cols-2")}>
                      {t.a.chips.map((c) => (
                        <div key={c.label} className="rounded-xl bg-slate-50 p-2.5 dark:bg-zinc-800/60">
                          <p className="text-base font-bold tracking-tight">{c.value}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">{c.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {thinking && (
            <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
              Reading your account
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </span>
            </p>
          )}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-zinc-800">
          <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto">
            {ACCOUNT_SUGGESTIONS.map((sug) => (
              <button key={sug} onClick={() => ask(sug)} className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300">
                {sug}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="How many bookings this month?" />
            <Button type="submit" disabled={!input.trim() || thinking}>Ask</Button>
          </form>
        </div>
      </Card>
    </>
  );
}

/* ---------------- AI tab ---------------- */

function AiTab({ wide, onEdit }: { wide: boolean; onEdit: (key: ListKey, row: Row | null) => void }) {
  const { content, updateAssistant } = useContent();
  const { assistant, knowledge } = content;
  const [test, setTest] = useState("");
  const [result, setResult] = useState<ReturnType<typeof answerQuestion> | null>(null);

  return (
    <div className={cn("gap-6", wide ? "grid grid-cols-[minmax(0,1fr)_360px] items-start" : "space-y-5")}>
      <div className="space-y-5">
        <DocumentUpload wide={wide} />
        <ListTab config={LISTS.knowledge} wide={wide} onEdit={onEdit} />
      </div>

      <div className="space-y-4">
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Assistant</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Show the Ask AI block on your page</p>
            </div>
            <Switch
              checked={assistant.enabled}
              onChange={(v) => updateAssistant({ enabled: v })}
              label="Enable assistant"
            />
          </div>
          <Field label="Assistant name">
            <Input value={assistant.name} onChange={(e) => updateAssistant({ name: e.target.value })} />
          </Field>
          <Field label="Greeting">
            <Textarea
              rows={3}
              value={assistant.greeting}
              onChange={(e) => updateAssistant({ greeting: e.target.value })}
            />
          </Field>
          <Field label="Suggested questions" hint="One per line">
            <Textarea
              rows={4}
              value={assistant.suggestions.join("\n")}
              onChange={(e) =>
                updateAssistant({ suggestions: e.target.value.split("\n").filter((l) => l.trim()) })
              }
            />
          </Field>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold">Test retrieval</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            See exactly what the assistant would answer.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setResult(answerQuestion(test, knowledge));
            }}
            className="mt-3 flex gap-2"
          >
            <Input
              value={test}
              onChange={(e) => setTest(e.target.value)}
              placeholder="e.g. what does it cost?"
            />
            <Button type="submit" disabled={!test.trim()}>
              Run
            </Button>
          </form>
          {result && (
            <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/60">
              <p className="text-sm leading-relaxed">{result.text}</p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wide text-slate-400">
                  {result.confident ? "Matched" : "No match"}
                </span>
                {result.sources.map((s) => (
                  <span
                    key={s.id}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Feed documents into the knowledge base so the public assistant can cite them. */
function DocumentUpload({ wide }: { wide: boolean }) {
  const { content, save, remove } = useContent();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const docs = useMemo(() => {
    const map = new Map<string, number>();
    for (const k of content.knowledge) {
      if (k.source) map.set(k.source, (map.get(k.source) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [content.knowledge]);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let added = 0;
    const notes: string[] = [];
    for (const file of Array.from(files)) {
      const result = await ingestFile(file);
      result.entries.forEach((entry) => {
        save("knowledge", entry as unknown as Record<string, unknown>);
        added += 1;
      });
      notes.push(result.note);
    }
    setBusy(false);
    toast(added ? `${added} entries added · ${notes[0]}` : notes[0] ?? "Nothing to add", added ? "success" : "info");
  };

  const removeDoc = (name: string) => {
    content.knowledge.filter((k) => k.source === name).forEach((k) => remove("knowledge", k.id));
    toast(`${name} removed from the knowledge base`, "info");
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Feed documents</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Upload notes, FAQs or policies. Text files are split into passages the assistant can quote.
          </p>
        </div>
        <FileUp size={16} className="shrink-0 text-brand-500" />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}
        className={cn(
          "mt-3 flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          over ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10" : "border-slate-200 hover:border-brand-400 dark:border-zinc-700",
        )}
      >
        <FileUp size={20} className={cn(busy ? "animate-pulse" : "", "text-slate-400")} />
        <span className="text-sm font-semibold">{busy ? "Reading…" : "Drop files or click to upload"}</span>
        <span className="text-[11px] text-slate-500 dark:text-zinc-400">
          .txt, .md, .csv, .json are parsed here · PDF and Word are added as a placeholder to paste into
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".txt,.md,.markdown,.csv,.json,.log,.rtf,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => { handle(e.target.files); e.target.value = ""; }}
      />

      {docs.length > 0 && (
        <div className={cn("mt-3 grid gap-2", wide ? "grid-cols-2" : "grid-cols-1")}>
          {docs.map(([name, count]) => (
            <div key={name} className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 dark:border-zinc-800">
              <FileText size={15} className="shrink-0 text-brand-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{name}</p>
                <p className="text-[10px] text-slate-400">{count} entr{count === 1 ? "y" : "ies"}</p>
              </div>
              <button onClick={() => removeDoc(name)} aria-label={`Remove ${name}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------------- design tab ---------------- */

function DesignTab({ wide }: { wide: boolean }) {
  return (
    <>
      <PageHeader
        title="Design & blocks"
        subtitle="What is on the page, and how it looks"
        wide={wide}
        action={
          <Link
            href="/webview"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            <ExternalLink size={13} /> Canvas editor
          </Link>
        }
      />
      <div className={cn("gap-6", wide ? "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start" : "space-y-6")}>
        <Card className="p-4">
          <BlockManager />
        </Card>
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Palette size={14} />
            </span>
            <div>
              <h3 className="text-sm font-bold">Appearance</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Template, banner, colours, fonts, layout</p>
            </div>
          </div>
          <Customizer hideTabs={["sections"]} />
        </Card>
      </div>
    </>
  );
}

/** Swap in one of the ready-made demo profiles. */
function ExamplesTab({ wide }: { wide: boolean }) {
  const { content, applyExample } = useContent();
  const { applyTemplate, setBlocks } = useDesign();
  const { toast } = useToast();

  return (
    <>
      <PageHeader
        title="Example profiles"
        subtitle="Four finished pages built from the same blocks — load one to explore"
        wide={wide}
      />
      <div className={cn("grid gap-3", wide ? "grid-cols-2" : "grid-cols-1")}>
        {EXAMPLE_PROFILES.map((ex) => {
          const current = (content.exampleId ?? "consultant") === ex.id;
          return (
            <Card key={ex.id} className={cn("flex flex-col p-4", current && "ring-2 ring-brand-500/60")}>
              <div className="flex items-start gap-3">
                <img src={ex.content.profile.avatar} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold">{ex.name}</p>
                    {current && (
                      <span className="shrink-0 rounded-full bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                        Loaded
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs font-medium text-brand-600 dark:text-brand-300">{ex.field}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{ex.blurb}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {ex.highlights.map((h) => (
                  <span key={h} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {h}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                <span>{ex.content.blocks.length} blocks</span>
                <span>{ex.content.services.length} services</span>
                <span>{ex.content.knowledge.length} knowledge entries</span>
              </div>

              <Button
                full
                className="mt-3"
                variant={current ? "outline" : "primary"}
                onClick={() => {
                  const r = applyExample(ex.id);
                  applyTemplate(r.template);
                  setBlocks(r.blocks);
                  toast(`${ex.name}'s profile loaded`);
                }}
              >
                {current ? "Reload this profile" : "Load this profile"}
              </Button>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-slate-400">
        Loading a profile replaces the demo content and page layout. Everything stays editable afterwards.
      </p>
    </>
  );
}

/* ---------------- editor sheet ---------------- */

function EditorSheet({
  editor,
  onClose,
}: {
  editor: { key: ListKey; row: Row | null } | null;
  onClose: () => void;
}) {
  const { save } = useContent();
  const { toast } = useToast();
  const { status, submit } = useFakeSubmit(700);
  const config = editor ? LISTS[editor.key] : null;

  const [values, setValues] = useState<Record<string, string>>({});
  const [openFor, setOpenFor] = useState<string | null>(null);

  // Reset the form whenever a different row is opened.
  const signature = editor ? `${editor.key}:${editor.row?.id ?? "new"}` : null;
  if (signature !== openFor) {
    setOpenFor(signature);
    const next: Record<string, string> = {};
    if (editor && config) {
      for (const f of config.fields) {
        const raw = editor.row?.[f.key];
        next[f.key] = Array.isArray(raw) ? raw.join(", ") : raw != null ? String(raw) : "";
      }
    }
    setValues(next);
  }

  if (!editor || !config) return null;

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const handle = async (e: FormEvent) => {
    await submit(e);
    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = values[f.key] ?? "";
      if (f.key === "tags") payload[f.key] = raw.split(",").map((t) => t.trim()).filter(Boolean);
      else if (f.type === "number") payload[f.key] = Number(raw) || 0;
      else payload[f.key] = raw;
    }
    if (editor.key === "events" && values.date) {
      const d = new Date(values.date);
      if (!Number.isNaN(d.getTime())) {
        payload.day = String(d.getDate());
        payload.month = d.toLocaleDateString("en-IN", { month: "short" });
      }
    }
    if (editor.key === "clients" && !values.initials) {
      payload.initials = monogram(values.name ?? "");
    }
    save(editor.key, payload, editor.row?.id);
    toast(editor.row ? "Changes saved" : `New ${config.noun} added`);
    onClose();
  };

  return (
    <Sheet open onClose={onClose} title={`${editor.row ? "Edit" : "Add"} ${config.noun}`}>
      <form onSubmit={handle} className="space-y-3">
        {config.fields.map((f) => (
          <Field key={f.key} label={f.label}>
            {f.type === "textarea" ? (
              <Textarea rows={4} value={values[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
            ) : f.type === "select" ? (
              <select
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                type={f.type ?? "text"}
                required={f.required}
                value={values[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </Field>
        ))}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" full size="lg" loading={status === "loading"}>
            {status === "loading" ? "Saving…" : editor.row ? "Save changes" : `Add ${config.noun}`}
          </Button>
        </div>
        <p className="text-center text-[11px] text-slate-400">
          Demo mode · saved in this browser and reflected on your public page
        </p>
      </form>
    </Sheet>
  );
}
