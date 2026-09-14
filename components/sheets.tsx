"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Share2,
  Sparkles,
  Upload,
  Video,
  X,
} from "lucide-react";
import { slots, type Job, type Service } from "@/data/mock";
import { useContent } from "@/components/content-store";
import { Button, Field, Input, Sheet, SuccessState, Textarea, cn } from "@/components/ui";
import { useToast } from "@/components/providers";
import { useFakeSubmit } from "@/lib/hooks";
import { FakeQr } from "@/components/fake-qr";

/* ======================= Booking ======================= */

type Step = "service" | "time" | "details" | "done";

const STEP_TITLES: Record<Step, string> = {
  service: "Choose a service",
  time: "Pick a date & time",
  details: "Your details",
  done: "Booking confirmed",
};

function buildMonth(month: Date): (Date | null)[] {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= count; d++) cells.push(new Date(y, m, d));
  return cells;
}

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Deterministic "already booked" slots so the calendar looks alive. */
const isBooked = (d: Date, i: number) => (d.getDate() * 7 + d.getMonth() * 3 + i) % 4 === 0;

const fmtDate = (d: Date | null, withYear = false) =>
  d?.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }) ?? "";

export function BookingSheet({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service: Service | null;
}) {
  const { toast } = useToast();
  const { content } = useContent();
  const { services } = content;
  const [selected, setSelected] = useState<Service | null>(null);
  const [step, setStep] = useState<Step>("service");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const { status, submit, reset } = useFakeSubmit(1400);

  useEffect(() => {
    if (!open) return;
    setSelected(service);
    setStep(service ? "time" : "service");
    setDate(null);
    setSlot(null);
    reset();
    const d = new Date();
    setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [open, service, reset]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const days = useMemo(() => buildMonth(month), [month]);
  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);

  const steps = useMemo(() => {
    const all: { id: Step; label: string }[] = [
      { id: "service", label: "Service" },
      { id: "time", label: "Date & time" },
      { id: "details", label: "Details" },
    ];
    return service ? all.slice(1) : all;
  }, [service]);

  const confirm = async (e: FormEvent) => {
    await submit(e);
    setStep("done");
  };

  return (
    <Sheet open={open} onClose={onClose} title={STEP_TITLES[step]}>
      {step !== "done" && <Stepper current={step} steps={steps} />}

      {step === "service" && (
        <div className="space-y-2.5">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelected(s);
                setStep("time");
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 p-3 text-left transition-all hover:border-brand-400 hover:bg-brand-50/40 active:scale-[0.98] dark:border-zinc-700 dark:hover:border-brand-500 dark:hover:bg-brand-500/10"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Sparkles size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{s.name}</span>
                <span className="block text-xs text-slate-500 dark:text-zinc-400">{s.duration} · 1:1</span>
              </span>
              <span className="text-sm font-bold">₹{s.price.toLocaleString("en-IN")}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}
        </div>
      )}

      {step === "time" && (
        <div>
          {selected && (
            <div className="flex items-center justify-between rounded-2xl bg-brand-50 px-3 py-2.5 text-sm dark:bg-brand-500/10">
              <span className="font-semibold text-brand-700 dark:text-brand-200">
                {selected.name} · ₹{selected.price.toLocaleString("en-IN")}
              </span>
              {!service && (
                <button onClick={() => setStep("service")} className="text-xs font-semibold text-brand-600 underline">
                  Change
                </button>
              )}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-slate-200 p-3 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <button
                disabled={!canPrev}
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-zinc-800"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="text-sm font-semibold">
                {month.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </p>
              <button
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                aria-label="Next month"
                className="rounded-lg p-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium text-slate-400">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-y-1">
              {days.map((d, i) => {
                if (!d) return <span key={`e${i}`} />;
                const disabled = d < today || d.getDay() === 0;
                const isSel = !!date && sameDay(d, date);
                const isToday = sameDay(d, today);
                return (
                  <button
                    key={d.toISOString()}
                    disabled={disabled}
                    onClick={() => {
                      setDate(d);
                      setSlot(null);
                    }}
                    className={cn(
                      "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all",
                      disabled && "text-slate-300 dark:text-zinc-700",
                      !disabled && !isSel && "hover:bg-brand-50 dark:hover:bg-brand-500/15",
                      isSel &&
                        "scale-105 bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/30",
                      isToday && !isSel && "ring-1 ring-brand-400",
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {date ? (
            <div className="mt-4 animate-fade-in">
              <p className="text-sm font-semibold">Available slots · {fmtDate(date)}</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {slots.map((s, i) => {
                  const booked = isBooked(date, i);
                  const sel = slot === s;
                  return (
                    <button
                      key={s}
                      disabled={booked}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "h-10 rounded-xl border text-sm font-medium transition-all active:scale-95",
                        booked &&
                          "border-dashed border-slate-200 text-slate-300 line-through dark:border-zinc-800 dark:text-zinc-600",
                        !booked &&
                          !sel &&
                          "border-slate-200 hover:border-brand-400 dark:border-zinc-700 dark:hover:border-brand-500",
                        sel && "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/30",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Times in IST · Google Meet or in-person at T. Nagar</p>
            </div>
          ) : (
            <p className="mt-4 text-center text-sm text-slate-400">Select a date to see available slots</p>
          )}

          <Button full size="lg" className="mt-5" disabled={!date || !slot} onClick={() => setStep("details")}>
            Continue <ChevronRight size={18} />
          </Button>
        </div>
      )}

      {step === "details" && (
        <form onSubmit={confirm} className="space-y-3">
          <SummaryCard service={selected} date={date} slot={slot} />
          <Field label="Full name">
            <Input required placeholder="Your name" autoComplete="name" />
          </Field>
          <Field label="Phone">
            <Input required type="tel" placeholder="+91 " autoComplete="tel" />
          </Field>
          <Field label="Email (optional)">
            <Input type="email" placeholder="you@email.com" autoComplete="email" />
          </Field>
          <Field label="What would you like to discuss?">
            <Textarea rows={3} placeholder="Briefly describe your goals…" />
          </Field>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep("time")}>
              <ChevronLeft size={18} /> Back
            </Button>
            <Button type="submit" full size="lg" loading={status === "loading"}>
              {status === "loading" ? "Confirming…" : "Confirm booking"}
            </Button>
          </div>
          <p className="text-center text-[11px] text-slate-400">Demo mode · No payment will be charged</p>
        </form>
      )}

      {step === "done" && (
        <SuccessState
          title="Appointment booked successfully"
          description="A confirmation with the meeting link has been sent to your phone and email."
        >
          <SummaryCard service={selected} date={date} slot={slot} />
          <Button full variant="secondary" onClick={() => toast("Added to your calendar")}>
            <CalendarDays size={16} /> Add to calendar
          </Button>
          <Button full onClick={onClose}>
            Done
          </Button>
        </SuccessState>
      )}
    </Sheet>
  );
}

function Stepper({ current, steps }: { current: Step; steps: { id: Step; label: string }[] }) {
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="mb-4 flex items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.id} className={cn("flex items-center gap-2", i < steps.length - 1 && "flex-1")}>
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors",
              i < idx && "bg-emerald-500 text-white",
              i === idx && "bg-brand-600 text-white",
              i > idx && "bg-slate-200 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400",
            )}
          >
            {i < idx ? <Check size={12} strokeWidth={3} /> : i + 1}
          </span>
          <span
            className={cn(
              "whitespace-nowrap text-xs font-medium",
              i === idx ? "text-slate-900 dark:text-white" : "text-slate-400",
            )}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />}
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ service, date, slot }: { service: Service | null; date: Date | null; slot: string | null }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3 text-left text-sm dark:bg-zinc-800/60">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{service?.name}</span>
        <span className="font-bold">₹{service?.price.toLocaleString("en-IN")}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={13} /> {fmtDate(date, true)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock size={13} /> {slot} · {service?.duration}
        </span>
        <span className="inline-flex items-center gap-1">
          <Video size={13} /> Google Meet
        </span>
      </div>
    </div>
  );
}

/* ======================= RSVP ======================= */

export function RsvpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { status, submit, reset } = useFakeSubmit(1300);
  const { toast } = useToast();
  const { content } = useContent();
  const event = content.events[0];

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  if (!event) return null;

  return (
    <Sheet open={open} onClose={onClose} title={status === "success" ? "You're in!" : "RSVP to event"}>
      {status === "success" ? (
        <SuccessState
          title="You are registered!"
          description={`See you at ${event.title} on ${event.date}. Your ticket has been emailed.`}
        >
          <div className="rounded-2xl border-2 border-dashed border-brand-300 p-3 text-left dark:border-brand-500/40">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">E-ticket</p>
            <p className="font-semibold">{event.title}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {event.date} · {event.time}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{event.venue}</p>
            <p className="mt-2 font-mono text-xs font-semibold text-brand-600 dark:text-brand-300">#OS4U-2931</p>
          </div>
          <Button full variant="secondary" onClick={() => toast("Added to your calendar")}>
            <CalendarDays size={16} /> Add to calendar
          </Button>
          <Button full onClick={onClose}>
            Done
          </Button>
        </SuccessState>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-800/60">
            <div className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-center shadow-sm dark:bg-zinc-900">
              <p className="text-[10px] font-bold uppercase text-rose-500">{event.month}</p>
              <p className="text-xl font-bold leading-none">{event.day}</p>
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">{event.title}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{event.time}</p>
              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{event.venue}</p>
            </div>
          </div>
          <Field label="Full name">
            <Input required placeholder="Your name" autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input required type="email" placeholder="you@email.com" autoComplete="email" />
          </Field>
          <Field label="Phone">
            <Input required type="tel" placeholder="+91 " autoComplete="tel" />
          </Field>
          <Button type="submit" full size="lg" loading={status === "loading"}>
            {status === "loading" ? "Reserving your seat…" : "Confirm RSVP · Free"}
          </Button>
          <p className="text-center text-[11px] text-slate-400">{event.attendees} people are going · Limited seats</p>
        </form>
      )}
    </Sheet>
  );
}

/* ======================= Apply ======================= */

export function ApplySheet({ job, onClose }: { job: Job | null; onClose: () => void }) {
  const { status, submit, reset } = useFakeSubmit(1300);
  const [resume, setResume] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      reset();
      setResume(null);
    }
  }, [job, reset]);

  return (
    <Sheet
      open={!!job}
      onClose={onClose}
      title={status === "success" ? "Application sent" : `Apply · ${job?.title ?? ""}`}
    >
      {status === "success" ? (
        <SuccessState
          title="Application submitted!"
          description={`Thanks for applying for ${job?.title}. Our team will reach out within 3–5 working days.`}
        >
          <Button full onClick={onClose}>
            Done
          </Button>
        </SuccessState>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <div className="rounded-2xl bg-slate-50 p-3 text-sm dark:bg-zinc-800/60">
            <p className="font-semibold">{job?.title}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {job?.location} · {job?.type} · {job?.pay}
            </p>
          </div>
          <Field label="Full name">
            <Input required placeholder="Your name" autoComplete="name" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <Input required type="email" placeholder="you@email.com" />
            </Field>
            <Field label="Phone">
              <Input required type="tel" placeholder="+91 " />
            </Field>
          </div>
          <Field label="LinkedIn / Portfolio URL">
            <Input type="url" placeholder="https://" />
          </Field>
          <Field label="Resume">
            <button
              type="button"
              onClick={() => setResume("Resume_2026.pdf")}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-sm transition-colors",
                resume
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-slate-200 text-slate-500 hover:border-brand-400 dark:border-zinc-700",
              )}
            >
              {resume ? (
                <>
                  <Check size={16} /> {resume} · 240 KB
                </>
              ) : (
                <>
                  <Upload size={16} /> Tap to upload resume (PDF)
                </>
              )}
            </button>
          </Field>
          <Field label="Why do you want to join? (optional)">
            <Textarea rows={3} placeholder="A line or two about you…" />
          </Field>
          <Button type="submit" full size="lg" loading={status === "loading"}>
            {status === "loading" ? "Submitting…" : "Submit application"}
          </Button>
        </form>
      )}
    </Sheet>
  );
}

/* ======================= QR / Share ======================= */

export function QrSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const { content } = useContent();
  const { profile } = content;
  const share = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: profile.name, text: profile.title, url: profile.url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(profile.url).catch(() => {});
      toast("Link copied · share it anywhere");
    }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Share profile">
      <div className="flex flex-col items-center">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-1 shadow-xl shadow-brand-600/30">
          <div className="rounded-[20px] bg-white p-4">
            <FakeQr size={210} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold leading-tight">{profile.name}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">onesite4u.com/{profile.handle}</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Scan to open this profile · Print it on your visiting card
        </p>
        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard?.writeText(profile.url).catch(() => {});
              toast("Link copied");
            }}
          >
            <Copy size={16} /> Copy
          </Button>
          <Button variant="outline" onClick={() => toast("QR saved as PNG")}>
            <Download size={16} /> Save
          </Button>
          <Button onClick={share}>
            <Share2 size={16} /> Share
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ======================= Lightbox ======================= */

export function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in" onClick={onClose}>
      <button aria-label="Close" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white">
        <X size={20} />
      </button>
      <img src={src} alt="" className="max-h-[85vh] w-full max-w-md rounded-2xl object-contain animate-scale-in" />
    </div>
  );
}
