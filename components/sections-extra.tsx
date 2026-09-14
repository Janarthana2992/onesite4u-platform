"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Bot,
  CalendarDays,
  Check,
  CircleDashed,
  Clock,
  CornerDownLeft,
  LoaderCircle,
  MessageSquarePlus,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Button, Card, Field, Input, SectionHeader, SuccessState, Textarea, cn } from "@/components/ui";
import { useFakeSubmit } from "@/lib/hooks";
import { useContent } from "@/components/content-store";
import { useSectionLabel } from "@/components/blocks/context";
import { answerQuestion } from "@/lib/rag";
import type { Knowledge } from "@/data/mock";

type Wide = { wide?: boolean };

/* ---------------- Experience ---------------- */

export function ExperienceSection({ wide }: Wide) {
  const { content } = useContent();
  const label = useSectionLabel("experience", "Experience", "Career and company timeline");

  return (
    <section id="experience" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <Card className="p-4">
        <ol className="relative space-y-5 border-l border-slate-200 pl-6 dark:border-zinc-800">
          {content.experience.map((x) => (
            <li key={x.id} className="relative">
              <span
                className={cn(
                  "absolute -left-[30px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-zinc-900",
                  x.current ? "bg-brand-600" : "bg-slate-300 dark:bg-zinc-700",
                )}
              >
                {x.current && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              <div className={cn(wide && "flex items-start justify-between gap-6")}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{x.role}</h3>
                    {x.current && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-300">{x.company}</p>
                  {x.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{x.description}</p>
                  )}
                </div>
                <p
                  className={cn(
                    "shrink-0 text-xs text-slate-400",
                    wide ? "text-right" : "mt-1",
                  )}
                >
                  {x.period}
                  {x.location && (
                    <>
                      <span className={cn(wide ? "block" : "ml-1")}>{wide ? x.location : `· ${x.location}`}</span>
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}

/* ---------------- Reviews ---------------- */

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-zinc-700"}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ wide }: Wide) {
  const { content } = useContent();
  const list = content.reviews;
  const average = list.length
    ? (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(1)
    : "0";
  const label = useSectionLabel(
    "reviews",
    "Reviews",
    `${average} average from ${list.length} review${list.length === 1 ? "" : "s"}`,
  );

  return (
    <section id="reviews" className="scroll-mt-4">
      <SectionHeader
        title={label.title}
        subtitle={label.subtitle ?? ""}
        wide={wide}
      />
      <div
        className={cn(
          wide
            ? "grid grid-cols-2 gap-4"
            : "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1",
        )}
      >
        {list.map((r) => (
          <Card
            key={r.id}
            className={cn("relative p-4", !wide && "w-[85%] shrink-0 snap-start")}
          >
            <Quote size={28} className="absolute right-3 top-3 text-brand-100 dark:text-brand-500/20" />
            <Stars rating={r.rating} />
            <p className="mt-2.5 text-sm leading-relaxed text-slate-700 dark:text-zinc-300">“{r.text}”</p>
            <div className="mt-4 flex items-center gap-2.5">
              <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r.author}</p>
                <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400">
                  {r.role} · {r.date}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Clients ---------------- */

export function ClientsSection({ wide }: Wide) {
  const { content } = useContent();
  const label = useSectionLabel("clients", "Clients", "Who I work with");

  return (
    <section id="clients" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <div className={cn("grid gap-3", wide ? "grid-cols-6" : "grid-cols-3")}>
        {content.clients.map((c) => (
          <Card key={c.id} className="flex flex-col items-center justify-center gap-2 p-3 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-sm font-bold text-white">
              {c.initials || c.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[11px] font-semibold leading-tight">{c.name}</span>
              <span className="block truncate text-[10px] text-slate-400">{c.industry}</span>
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}

/* ---------------- AI assistant (RAG demo) ---------------- */

type Message =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "bot"; text: string; sources: Knowledge[]; confident: boolean };

export function AssistantSection({ wide, onBook }: Wide & { onBook: () => void }) {
  const { content } = useContent();
  const { assistant, knowledge, profile } = content;
  const label = useSectionLabel(
    "assistant",
    assistant.name,
    `Answers from ${knowledge.length} knowledge entries`,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [typed, setTyped] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typed, thinking]);

  const ask = (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;

    setInput("");
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: q }]);
    setThinking(true);
    setTyped(null);

    // Simulated retrieval latency, then a word-by-word reveal of the answer.
    timers.current.push(
      setTimeout(() => {
        const answer = answerQuestion(q, knowledge);
        setThinking(false);

        const words = answer.text.split(" ");
        words.forEach((_, i) => {
          timers.current.push(
            setTimeout(() => setTyped(words.slice(0, i + 1).join(" ")), i * 22),
          );
        });

        timers.current.push(
          setTimeout(() => {
            setTyped(null);
            setMessages((m) => [
              ...m,
              {
                id: Date.now(),
                role: "bot",
                text: answer.text,
                sources: answer.sources,
                confident: answer.confident,
              },
            ]);
          }, words.length * 22 + 60),
        );
      }, 700),
    );
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const started = messages.length > 0 || thinking || typed !== null;

  return (
    <section id="assistant" className="scroll-mt-4">
      <SectionHeader {...label} wide={wide} />
      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-brand-600 to-accent-600 p-4 text-white dark:border-zinc-800">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Bot size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{assistant.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              Trained on {profile.name.split(" ")[0]}&apos;s knowledge base
            </p>
          </div>
          <Sparkles size={16} className="text-white/70" />
        </div>

        <div
          ref={threadRef}
          className={cn(
            "space-y-3 overflow-y-auto p-4",
            started ? (wide ? "max-h-96" : "max-h-80") : "",
          )}
        >
          <div className="flex gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Bot size={15} />
            </span>
            <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
              {assistant.greeting}
            </p>
          </div>

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <Bot size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {m.text}
                  </p>
                  {m.sources.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">Sources</span>
                      {m.sources.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        >
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {!m.confident && (
                    <Button size="sm" className="mt-2" onClick={onBook}>
                      <CalendarDays size={14} /> Book a call
                    </Button>
                  )}
                </div>
              </div>
            ),
          )}

          {thinking && (
            <div className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Bot size={15} />
              </span>
              <p className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2.5 text-xs text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                Searching knowledge base
                <span className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </span>
              </p>
            </div>
          )}

          {typed !== null && (
            <div className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Bot size={15} />
              </span>
              <p className="rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                {typed}
                <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-slate-500 align-middle" />
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-zinc-800">
          {!started && assistant.suggestions.length > 0 && (
            <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto">
              {assistant.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="shrink-0 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={submit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <Button type="submit" disabled={!input.trim() || thinking} aria-label="Send question">
              <CornerDownLeft size={16} />
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Demo assistant · answers are retrieved from the knowledge base, no external AI service
          </p>
        </div>
      </Card>
    </section>
  );
}



/* ---------------- Progress tracker (promises, roadmap, track record) ---------------- */

const STATUS: Record<string, { label: string; icon: typeof Check; cls: string; bar: string }> = {
  done: {
    label: "Delivered",
    icon: Check,
    cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    bar: "bg-emerald-500",
  },
  progress: {
    label: "In progress",
    icon: LoaderCircle,
    cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    bar: "bg-amber-500",
  },
  planned: {
    label: "Planned",
    icon: CircleDashed,
    cls: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
    bar: "bg-slate-400",
  },
};

export function MilestonesSection({ wide }: Wide) {
  const { content } = useContent();
  const list = content.milestones;
  const label = useSectionLabel("milestones", "Progress tracker", "What was promised and where it stands");
  const done = list.filter((m) => m.status === "done").length;

  return (
    <section id="milestones" className="scroll-mt-4">
      <SectionHeader
        title={label.title}
        subtitle={label.subtitle}
        wide={wide}
        action={
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
            {done}/{list.length} delivered
          </span>
        }
      />
      <div className={cn("grid gap-3", wide && "grid-cols-2")}>
        {list.map((m) => {
          const s = STATUS[m.status] ?? STATUS.planned;
          const Icon = s.icon;
          return (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{m.title}</h3>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    s.cls,
                  )}
                >
                  <Icon size={11} /> {s.label}
                </span>
              </div>
              {m.description && (
                <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">{m.description}</p>
              )}
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", s.bar)}
                    style={{ width: `${Math.min(100, Math.max(0, m.progress))}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>{m.meta}</span>
                  <span className="font-semibold">{m.progress}%</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Request desk (grievances, enquiries, support) ---------------- */

export function GrievanceSection({ wide }: Wide) {
  const { content } = useContent();
  const { grievance } = content;
  const label = useSectionLabel("grievance", "Raise a request", "We respond to every submission");
  const { status, submit, reset } = useFakeSubmit(1300);
  const [category, setCategory] = useState(grievance.categories[0] ?? "");
  const ref = useMemo(() => `REQ-${Math.floor(1000 + Math.random() * 8999)}`, []);

  return (
    <section id="grievance" className="scroll-mt-4">
      <SectionHeader title={label.title} subtitle={label.subtitle} wide={wide} />
      <Card className="overflow-hidden">
        {status === "success" ? (
          <div className="p-5">
            <SuccessState
              title="Request registered"
              description={`Your reference number is ${ref}. ${grievance.sla}.`}
            >
              <div className="rounded-2xl border-2 border-dashed border-brand-300 p-3 text-left dark:border-brand-500/40">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Reference</p>
                <p className="font-mono text-lg font-bold text-brand-600 dark:text-brand-300">{ref}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Category: {category || grievance.categories[0]}
                </p>
              </div>
              <Button full variant="outline" onClick={reset}>
                <MessageSquarePlus size={16} /> Raise another
              </Button>
            </SuccessState>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
              <ShieldCheck size={14} className="shrink-0" />
              {grievance.sla}
            </div>

            <Field label="Category">
              <div className={cn("grid gap-1.5", wide ? "grid-cols-3" : "grid-cols-2")}>
                {grievance.categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-all active:scale-95",
                      category === c
                        ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                        : "border-slate-200 text-slate-600 hover:border-brand-400 dark:border-zinc-700 dark:text-zinc-300",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Field>

            <div className={cn("gap-3", wide ? "grid grid-cols-2" : "space-y-3")}>
              <Field label="Your name">
                <Input required placeholder="Full name" autoComplete="name" />
              </Field>
              <Field label="Phone">
                <Input required type="tel" placeholder="+91 " autoComplete="tel" />
              </Field>
            </div>

            {grievance.askLocation && (
              <Field label={grievance.locationLabel}>
                <Input placeholder={grievance.locationLabel} />
              </Field>
            )}

            <Field label="Describe the issue">
              <Textarea rows={3} required placeholder="What happened, and where?" />
            </Field>

            {grievance.note && (
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-zinc-400">
                <AlertCircle size={13} className="mt-px shrink-0" />
                {grievance.note}
              </p>
            )}

            <Button type="submit" full size="lg" loading={status === "loading"}>
              {status === "loading" ? (
                "Registering…"
              ) : (
                <>
                  <Send size={16} /> Submit request
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </section>
  );
}
