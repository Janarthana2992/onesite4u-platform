"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  Check,
  CornerDownLeft,
  Mic,
  MicOff,
  MessageCircle,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useContent } from "@/components/content-store";
import { useScrollScope } from "@/components/design-store";
import { useToast } from "@/components/providers";
import { profileUrl } from "@/lib/site";
import { INITIAL, respond, suggestions, type ChatAction, type ChatState, type Reply } from "@/lib/chat-agent";
import { cn } from "@/lib/cn";

type Msg =
  | { id: number; from: "you"; text: string }
  | ({ id: number; from: "bot" } & Reply);

/* ---------------- speech ---------------- */

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const getRecognition = (): SpeechRecognitionLike | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  const Ctor = (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => SpeechRecognitionLike)
    | undefined;
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "en-IN";
  r.interimResults = false;
  r.continuous = false;
  return r;
};

/**
 * A concierge on every profile: answers questions from the knowledge base and
 * completes bookings, RSVPs, applications, sign-ups and requests without the
 * visitor leaving the conversation. Typed or spoken.
 */
export function ChatWidget({ offset = false }: { offset?: boolean }) {
  const { content } = useContent();
  const { toast } = useToast();
  const { scrollToId } = useScrollScope();
  const { profile } = content;

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ChatState>(INITIAL);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [voiceReady, setVoiceReady] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  useEffect(() => setVoiceReady(getRecognition() !== null), []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking]);

  // Greet on first open, tailored to what this profile actually offers.
  useEffect(() => {
    if (!open || msgs.length) return;
    setMsgs([
      {
        id: nextId(),
        from: "bot",
        text: `Hello! I'm ${profile.name.split(" ")[0]}'s assistant. I can answer questions or get things done for you right here — booking, registering, applying, whatever you need.`,
        chips: suggestions(content),
      },
    ]);
  }, [open, msgs.length, content, profile.name]);

  const say = useCallback(
    (text: string) => {
      if (!speak || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-IN";
      window.speechSynthesis.speak(u);
    },
    [speak],
  );

  const perform = useCallback(
    (action: ChatAction) => {
      const tel = profile.phone.replace(/\s/g, "");
      if (action.type === "call") window.location.href = `tel:${tel}`;
      else if (action.type === "whatsapp")
        window.open(`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent("Hi!")}`, "_blank");
      else if (action.type === "email") window.location.href = `mailto:${profile.email}`;
      else if (action.type === "share") {
        const url = profileUrl(profile.handle);
        if (navigator.share) navigator.share({ title: profile.name, url }).catch(() => {});
        else {
          navigator.clipboard?.writeText(url).catch(() => {});
          toast("Link copied");
        }
      } else if (action.type === "vcard") {
        const vcf = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `FN:${profile.name}`,
          `TEL;TYPE=CELL:${tel}`,
          `EMAIL:${profile.email}`,
          "END:VCARD",
        ].join("\n");
        const blob = new Blob([vcf], { type: "text/vcard" });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${profile.name.replace(/\s+/g, "-")}.vcf`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      } else if (action.type === "scroll") {
        setOpen(false);
        scrollToId(action.blockType);
      }
    },
    [profile, toast, scrollToId],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || thinking) return;
      setInput("");
      setMsgs((m) => [...m, { id: nextId(), from: "you", text }]);
      setThinking(true);

      // A beat of thinking time so replies do not snap in unnaturally.
      setTimeout(() => {
        const turn = respond(state, text, content);
        setState(turn.state);
        setThinking(false);
        setMsgs((m) => [...m, ...turn.replies.map((r) => ({ id: nextId(), from: "bot" as const, ...r }))]);
        turn.replies.forEach((r) => {
          if (r.action) perform(r.action);
        });
        say(turn.replies.map((r) => r.text).join(" "));
      }, 480);
    },
    [state, content, thinking, perform, say],
  );

  const toggleMic = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = getRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.onresult = (e) => {
      const said = e.results?.[0]?.[0]?.transcript ?? "";
      if (said) send(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* the bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : `Chat with ${profile.name.split(" ")[0]}'s assistant`}
        aria-expanded={open}
        className={cn(
          "fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-xl shadow-brand-600/40 transition-transform active:scale-90",
          offset ? "bottom-40" : "bottom-24",
          "lg:bottom-6",
        )}
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold ring-2 ring-white dark:ring-zinc-950">
            <Sparkles size={9} />
          </span>
        )}
      </button>

      {/* the panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Assistant"
          className={cn(
            "fixed inset-x-3 bottom-40 z-50 flex max-h-[68dvh] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-slide-up dark:border-zinc-800 dark:bg-zinc-900",
            offset ? "bottom-56" : "bottom-40",
            "sm:inset-x-auto sm:right-4 sm:w-[24rem] lg:bottom-24 lg:max-h-[34rem]",
          )}
        >
          <header className="flex items-center gap-2.5 bg-gradient-to-r from-brand-600 to-accent-600 p-3.5 text-white">
            <img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-white/40" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{profile.name.split(" ")[0]}&apos;s assistant</p>
              <p className="flex items-center gap-1 text-[11px] text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Books, registers and answers — right here
              </p>
            </div>
            <button
              onClick={() => setSpeak((s) => !s)}
              aria-label={speak ? "Turn off spoken replies" : "Read replies aloud"}
              title={speak ? "Spoken replies on" : "Spoken replies off"}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15"
            >
              {speak ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15"
            >
              <X size={17} />
            </button>
          </header>

          <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {msgs.map((m, i) =>
              m.from === "you" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3 py-2 text-sm text-white">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={m.id} className="space-y-2">
                  <p className="max-w-[92%] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-sm leading-relaxed text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {m.text}
                  </p>

                  {m.sources && m.sources.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-slate-400">From</span>
                      {m.sources.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.receipt && (
                    <div className="rounded-2xl border-2 border-dashed border-brand-300 p-3 dark:border-brand-500/40">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check size={15} strokeWidth={3} />
                        </span>
                        <p className="text-sm font-bold">{m.receipt.title}</p>
                      </div>
                      <dl className="mt-2 space-y-1">
                        {m.receipt.rows.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-3 text-xs">
                            <dt className="shrink-0 text-slate-500 dark:text-zinc-400">{k}</dt>
                            <dd className="truncate text-right font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-2 font-mono text-xs font-bold text-brand-600 dark:text-brand-300">
                        {m.receipt.reference}
                      </p>
                    </div>
                  )}

                  {m.chips && m.chips.length > 0 && i === msgs.length - 1 && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => send(c)}
                          className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}

            {thinking && (
              <p className="flex w-fit items-center gap-1.5 rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2.5 dark:bg-zinc-800">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </p>
            )}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-100 p-2.5 dark:border-zinc-800">
            {voiceReady && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Speak instead of typing"}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  listening
                    ? "bg-rose-500 text-white"
                    : "bg-slate-100 text-slate-500 hover:text-brand-600 dark:bg-zinc-800 dark:text-zinc-300",
                )}
              >
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Ask, or say what you need…"}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 text-white disabled:opacity-40"
            >
              <CornerDownLeft size={17} />
            </button>
          </form>
          <p className="pb-2 text-center text-[10px] text-slate-400">
            Demo · nothing is sent anywhere{voiceReady ? " · voice runs in your browser" : ""}
          </p>
        </div>
      )}
    </>
  );
}
