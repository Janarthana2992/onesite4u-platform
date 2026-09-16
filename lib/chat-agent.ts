/**
 * The concierge behind the chat bubble. A pure state machine: it takes the
 * conversation so far plus whatever the visitor typed or said, and returns the
 * next state, what to say, and any action the UI should carry out.
 *
 * Kept free of React so the flows can be tested on their own.
 */

import type { Content } from "@/components/content-store";
import { answerQuestion } from "@/lib/rag";
import { freeSlots, fmtDay, fmtDayLong, nextOpenDays } from "@/lib/slots";

export type Flow = "idle" | "book" | "rsvp" | "apply" | "subscribe" | "request";

export type ChatState = {
  flow: Flow;
  step: number;
  data: Record<string, string>;
};

export const INITIAL: ChatState = { flow: "idle", step: 0, data: {} };

/** Something the UI performs on the visitor's behalf. */
export type ChatAction =
  | { type: "call" }
  | { type: "whatsapp" }
  | { type: "email" }
  | { type: "vcard" }
  | { type: "share" }
  | { type: "scroll"; blockType: string };

export type Reply = {
  text: string;
  /** Tappable shortcuts for the next answer. */
  chips?: string[];
  /** Cited knowledge entries, when the answer came from the knowledge base. */
  sources?: string[];
  /** A summary card shown when a flow completes. */
  receipt?: { title: string; rows: [string, string][]; reference: string };
  action?: ChatAction;
};

export type Turn = { state: ChatState; replies: Reply[] };

/* ---------------- intent ---------------- */

const HAS = (text: string, words: string[]) => words.some((w) => text.includes(w));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s-]{7,17}$/;

type ActionIntent = "call" | "whatsapp" | "email" | "vcard" | "share";

export function detectIntent(
  raw: string,
  content: Content,
): Exclude<Flow, "idle"> | "ask" | ActionIntent {
  const t = raw.toLowerCase().trim();

  if (HAS(t, ["call ", "phone him", "phone her", "ring ", "call now", "call you"])) return "call";
  if (HAS(t, ["whatsapp", "whats app"])) return "whatsapp";
  if (HAS(t, ["save contact", "vcard", "add to contacts"])) return "vcard";
  if (HAS(t, ["share this", "share profile", "send me the link"])) return "share";

  if (HAS(t, ["book", "appointment", "schedule a", "meet ", "consult", "slot"])) return "book";
  if (content.events.length > 0 && HAS(t, ["rsvp", "register for", "attend", "workshop", "camp", "event"])) return "rsvp";
  if (content.jobs.some((j) => j.open) && HAS(t, ["apply", "job", "vacancy", "hiring", "internship", "volunteer"]))
    return "apply";
  if (HAS(t, ["subscribe", "newsletter", "mailing list", "updates"])) return "subscribe";
  if (content.grievance.enabled && HAS(t, ["complaint", "grievance", "raise a", "request", "issue", "problem", "enquiry", "enquire"]))
    return "request";

  return "ask";
}

/* ---------------- flow definitions ---------------- */

type StepDef = {
  key: string;
  prompt: (c: Content, data: Record<string, string>) => string;
  chips?: (c: Content, data: Record<string, string>) => string[];
  /** Returns an error message when the answer will not do. */
  validate?: (value: string) => string | null;
  /**
   * When true the answer must be one of the offered options, so a stale chip or
   * a stray sentence cannot end up as the appointment date.
   */
  choice?: boolean;
};

/** Matches loosely — case and spacing should not matter to a person answering. */
function matchOption(value: string, options: string[]): string | null {
  const v = value.trim().toLowerCase();
  return (
    options.find((o) => o.toLowerCase() === v) ??
    options.find((o) => o.toLowerCase().includes(v) && v.length >= 3) ??
    options.find((o) => v.includes(o.toLowerCase())) ??
    null
  );
}

const nameStep: StepDef = {
  key: "name",
  prompt: () => "And your name?",
  validate: (v) => (v.trim().length < 2 ? "That looks a little short — what is your full name?" : null),
};

const phoneStep: StepDef = {
  key: "phone",
  prompt: () => "A phone number we can reach you on?",
  validate: (v) => (PHONE_RE.test(v.trim()) ? null : "That does not look like a phone number. Try something like +91 98400 12345."),
};

const emailStep: StepDef = {
  key: "email",
  prompt: () => "What is your email address?",
  validate: (v) => (EMAIL_RE.test(v.trim()) ? null : "That email does not look right — could you check it?"),
};

const FLOWS: Record<Exclude<Flow, "idle">, { intro: (c: Content) => string; steps: StepDef[] }> = {
  book: {
    intro: () => "Happy to get that booked. A couple of quick questions.",
    steps: [
      {
        key: "service",
        prompt: () => "Which would you like?",
        chips: (c) => c.services.map((s) => s.name),
        choice: true,
      },
      {
        key: "day",
        prompt: () => "Which day suits you?",
        chips: () => nextOpenDays(5).map(fmtDay),
        choice: true,
      },
      {
        key: "time",
        prompt: () => "And what time?",
        chips: (_c, data) => {
          const day = nextOpenDays(5).find((d) => fmtDay(d) === data.day);
          return day ? freeSlots(day) : [];
        },
        choice: true,
      },
      nameStep,
      phoneStep,
    ],
  },
  rsvp: {
    intro: (c) => `Lovely — ${c.events[0]?.title ?? "the event"} it is.`,
    steps: [nameStep, emailStep, phoneStep],
  },
  apply: {
    intro: () => "Good to hear. Let's get your application in.",
    steps: [
      {
        key: "role",
        prompt: () => "Which role are you applying for?",
        chips: (c) => c.jobs.filter((j) => j.open).map((j) => j.title),
        choice: true,
      },
      nameStep,
      emailStep,
      phoneStep,
    ],
  },
  subscribe: {
    intro: () => "You will get occasional updates, nothing more.",
    steps: [emailStep],
  },
  request: {
    intro: (c) => c.grievance.sla || "We respond to every request.",
    steps: [
      {
        key: "category",
        prompt: () => "What is it about?",
        chips: (c) => c.grievance.categories,
        choice: true,
      },
      nameStep,
      phoneStep,
      {
        key: "detail",
        prompt: () => "Tell me what happened, in your own words.",
        validate: (v) => (v.trim().length < 8 ? "A little more detail would help." : null),
      },
    ],
  },
};

const reference = (prefix: string) => `${prefix}-${Math.floor(1000 + Math.random() * 8999)}`;

function receiptFor(flow: Exclude<Flow, "idle">, data: Record<string, string>, c: Content): Reply {
  switch (flow) {
    case "book": {
      const service = c.services.find((s) => s.name === data.service);
      const day = nextOpenDays(5).find((d) => fmtDay(d) === data.day);
      return {
        text: `Done, ${data.name.split(" ")[0]} — you're booked. A confirmation is on its way to ${data.phone}.`,
        receipt: {
          title: "Appointment confirmed",
          reference: reference("APT"),
          rows: [
            ["Service", data.service],
            ["When", `${day ? fmtDayLong(day) : data.day}, ${data.time}`],
            ["Duration", service?.duration ?? "—"],
            ["Fee", service ? (service.price ? `₹${service.price.toLocaleString("en-IN")}` : "Free") : "—"],
          ],
        },
      };
    }
    case "rsvp": {
      const ev = c.events[0];
      return {
        text: `You're registered, ${data.name.split(" ")[0]}. Your ticket is on its way to ${data.email}.`,
        receipt: {
          title: "You're registered",
          reference: reference("RSVP"),
          rows: [
            ["Event", ev?.title ?? "—"],
            ["When", ev ? `${ev.date}, ${ev.time}` : "—"],
            ["Where", ev?.venue ?? "—"],
          ],
        },
      };
    }
    case "apply":
      return {
        text: `Application in, ${data.name.split(" ")[0]}. The team reviews these within three to five working days.`,
        receipt: {
          title: "Application submitted",
          reference: reference("APP"),
          rows: [
            ["Role", data.role],
            ["Email", data.email],
            ["Phone", data.phone],
          ],
        },
      };
    case "subscribe":
      return {
        text: "Subscribed. You can unsubscribe from any email, any time.",
        receipt: { title: "Subscribed", reference: reference("SUB"), rows: [["Email", data.email]] },
      };
    case "request":
      return {
        text: `Registered. Quote your reference if you follow up — ${c.grievance.sla.toLowerCase()}.`,
        receipt: {
          title: "Request registered",
          reference: reference("REQ"),
          rows: [
            ["Category", data.category],
            ["From", data.name],
            ["Phone", data.phone],
          ],
        },
      };
  }
}

/* ---------------- the machine ---------------- */

export function suggestions(c: Content): string[] {
  const out: string[] = [];
  if (c.services.length) out.push("Book an appointment");
  if (c.events.length) out.push("RSVP to the event");
  if (c.grievance.enabled) out.push("Raise a request");
  if (c.jobs.some((j) => j.open)) out.push("Apply for a role");
  out.push(c.knowledge.length ? "What does it cost?" : "How do I get in touch?");
  return out.slice(0, 4);
}

const cancelWords = ["cancel", "stop", "never mind", "nevermind", "quit", "exit"];

export function respond(state: ChatState, input: string, content: Content): Turn {
  const text = input.trim();
  if (!text) return { state, replies: [] };

  // Let people out of a flow at any point.
  if (state.flow !== "idle" && cancelWords.includes(text.toLowerCase())) {
    return {
      state: INITIAL,
      replies: [{ text: "No problem, I've stopped that. Anything else?", chips: suggestions(content) }],
    };
  }

  // Mid-flow: treat the message as the answer to the current step.
  if (state.flow !== "idle") {
    const def = FLOWS[state.flow];
    const step = def.steps[state.step];
    const options = step.chips?.(content, state.data) ?? [];

    let value = text;
    if (step.choice) {
      const picked = matchOption(text, options);
      if (!picked) {
        return {
          state,
          replies: [{ text: "Let's pick from these so I get it right:", chips: options }],
        };
      }
      value = picked;
    }

    const error = step.validate?.(value);
    if (error) {
      return { state, replies: [{ text: error, chips: options }] };
    }

    const data = { ...state.data, [step.key]: value };
    const next = state.step + 1;

    if (next >= def.steps.length) {
      return { state: { ...INITIAL, data: {} }, replies: [receiptFor(state.flow, data, content)] };
    }

    const nextStep = def.steps[next];
    return {
      state: { flow: state.flow, step: next, data },
      replies: [{ text: nextStep.prompt(content, data), chips: nextStep.chips?.(content, data) }],
    };
  }

  // Idle: work out what they want.
  const intent = detectIntent(text, content);

  if (intent === "call" || intent === "whatsapp" || intent === "email" || intent === "vcard" || intent === "share") {
    const said: Record<ActionIntent, string> = {
      call: `Calling ${content.profile.name.split(" ")[0]} now.`,
      whatsapp: "Opening WhatsApp.",
      email: "Opening your email app.",
      vcard: "Saving the contact card to your device.",
      share: "Opening the share sheet.",
    };
    return { state, replies: [{ text: said[intent], action: { type: intent } as ChatAction }] };
  }

  if (intent === "ask") {
    const answer = answerQuestion(text, content.knowledge);
    return {
      state,
      replies: [
        {
          text: answer.text,
          sources: answer.sources.map((s) => s.title),
          chips: answer.confident ? undefined : suggestions(content),
        },
      ],
    };
  }

  // Starting a flow.
  const def = FLOWS[intent];
  const first = def.steps[0];
  return {
    state: { flow: intent, step: 0, data: {} },
    replies: [
      { text: def.intro(content) },
      { text: first.prompt(content, {}), chips: first.chips?.(content, {}) },
    ],
  };
}
