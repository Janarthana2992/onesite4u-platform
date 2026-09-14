/**
 * Private account assistant. Answers the owner's questions about their own
 * account from live demo data — never exposed on the public page.
 */

import { tokenize } from "@/lib/rag";

export type AccountFacts = {
  views: number;
  clicks: number;
  bookings: number;
  subscribers: number;
  weekly: { day: string; value: number }[];
  links: { title: string; clicks: number; visible: boolean }[];
  services: { name: string; price: number; bookings: number }[];
  requests: { status: string; category: string }[];
  reviews: { rating: number }[];
  jobs: { title: string; applicants: number; open: boolean }[];
  events: { title: string; attendees: number }[];
  knowledgeCount: number;
  blocks: { label: string; live: boolean }[];
};

export type AccountAnswer = { text: string; chips: { label: string; value: string }[] };

const pct = (a: number, b: number) => (b === 0 ? "0%" : `${Math.round((a / b) * 100)}%`);
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

type Rule = {
  id: string;
  keywords: string[];
  answer: (f: AccountFacts) => AccountAnswer;
};

const RULES: Rule[] = [
  {
    id: "views",
    keywords: ["view", "views", "traffic", "visitor", "visitors", "seen", "reach"],
    answer: (f) => {
      const best = [...f.weekly].sort((a, b) => b.value - a.value)[0];
      const avg = Math.round(f.weekly.reduce((s, d) => s + d.value, 0) / f.weekly.length);
      return {
        text: `Your page has ${f.views.toLocaleString("en-IN")} views. Over the last seven days you averaged ${avg} a day, peaking on ${best.day} with ${best.value}.`,
        chips: [
          { label: "Total views", value: f.views.toLocaleString("en-IN") },
          { label: "Daily average", value: String(avg) },
          { label: "Best day", value: `${best.day} · ${best.value}` },
        ],
      };
    },
  },
  {
    id: "clicks",
    keywords: ["click", "clicks", "link", "links", "ctr", "engagement", "popular"],
    answer: (f) => {
      const top = [...f.links].sort((a, b) => b.clicks - a.clicks);
      const best = top[0];
      const worst = top[top.length - 1];
      return {
        text: `You have ${f.clicks} link clicks from ${f.views.toLocaleString("en-IN")} views, a click rate of ${pct(f.clicks, f.views)}. “${best?.title}” is your strongest link with ${best?.clicks} clicks; “${worst?.title}” is the weakest with ${worst?.clicks}. Moving the weak one up or rewriting its subtitle usually helps.`,
        chips: [
          { label: "Clicks", value: String(f.clicks) },
          { label: "Click rate", value: pct(f.clicks, f.views) },
          { label: "Top link", value: best?.title ?? "—" },
        ],
      };
    },
  },
  {
    id: "bookings",
    keywords: ["booking", "bookings", "appointment", "appointments", "revenue", "earn", "income", "session"],
    answer: (f) => {
      const revenue = f.services.reduce((s, x) => s + x.price * x.bookings, 0);
      const top = [...f.services].sort((a, b) => b.bookings - a.bookings)[0];
      return {
        text: `You have ${f.bookings} bookings this month across ${f.services.length} services, worth ${inr(revenue)} at list price. “${top?.name}” is booked most often (${top?.bookings} times). That is a ${pct(f.bookings, f.views)} conversion from page views.`,
        chips: [
          { label: "Bookings", value: String(f.bookings) },
          { label: "Value", value: inr(revenue) },
          { label: "Conversion", value: pct(f.bookings, f.views) },
        ],
      };
    },
  },
  {
    id: "subscribers",
    keywords: ["subscriber", "subscribers", "newsletter", "email", "list", "audience"],
    answer: (f) => ({
      text: `Your newsletter has ${f.subscribers} subscribers, which is ${pct(f.subscribers, f.views)} of everyone who has seen the page. Keeping the newsletter block above the fold on mobile is the single biggest lever on that number.`,
      chips: [
        { label: "Subscribers", value: String(f.subscribers) },
        { label: "Sign-up rate", value: pct(f.subscribers, f.views) },
      ],
    }),
  },
  {
    id: "requests",
    keywords: ["request", "requests", "grievance", "complaint", "ticket", "pending", "open"],
    answer: (f) => {
      const open = f.requests.filter((r) => r.status !== "Resolved").length;
      const counts = new Map<string, number>();
      f.requests.forEach((r) => counts.set(r.category, (counts.get(r.category) ?? 0) + 1));
      const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
      return {
        text: `There are ${open} open requests out of ${f.requests.length} in total. The most common category is “${top?.[0]}” with ${top?.[1]}. Resolved so far: ${f.requests.length - open}.`,
        chips: [
          { label: "Open", value: String(open) },
          { label: "Total", value: String(f.requests.length) },
          { label: "Most common", value: top?.[0] ?? "—" },
        ],
      };
    },
  },
  {
    id: "reviews",
    keywords: ["review", "reviews", "rating", "ratings", "feedback", "stars"],
    answer: (f) => {
      const avg = f.reviews.length ? f.reviews.reduce((s, r) => s + r.rating, 0) / f.reviews.length : 0;
      const fives = f.reviews.filter((r) => r.rating === 5).length;
      return {
        text: `You have ${f.reviews.length} reviews averaging ${avg.toFixed(1)} out of 5, with ${fives} five-star ratings.`,
        chips: [
          { label: "Reviews", value: String(f.reviews.length) },
          { label: "Average", value: avg.toFixed(1) },
        ],
      };
    },
  },
  {
    id: "jobs",
    keywords: ["job", "jobs", "applicant", "applicants", "hiring", "role", "roles", "apprentice", "volunteer"],
    answer: (f) => {
      const open = f.jobs.filter((j) => j.open);
      const total = f.jobs.reduce((s, j) => s + j.applicants, 0);
      const top = [...f.jobs].sort((a, b) => b.applicants - a.applicants)[0];
      return {
        text: `You have ${open.length} open roles and ${total} applicants in total. “${top?.title}” is attracting the most interest with ${top?.applicants}.`,
        chips: [
          { label: "Open roles", value: String(open.length) },
          { label: "Applicants", value: String(total) },
        ],
      };
    },
  },
  {
    id: "events",
    keywords: ["event", "events", "rsvp", "rsvps", "workshop", "camp", "attend"],
    answer: (f) => {
      const total = f.events.reduce((s, e) => s + e.attendees, 0);
      return {
        text: f.events.length
          ? `You have ${f.events.length} event${f.events.length === 1 ? "" : "s"} with ${total} RSVPs. “${f.events[0].title}” has ${f.events[0].attendees}.`
          : "You have no events on the page right now. Add the Event block to start collecting RSVPs.",
        chips: [
          { label: "Events", value: String(f.events.length) },
          { label: "RSVPs", value: String(total) },
        ],
      };
    },
  },
  {
    id: "page",
    keywords: ["page", "block", "blocks", "section", "sections", "live", "empty", "setup", "profile"],
    answer: (f) => {
      const live = f.blocks.filter((b) => b.live);
      const idle = f.blocks.filter((b) => !b.live);
      return {
        text: `Your page has ${f.blocks.length} blocks and ${live.length} are live. ${
          idle.length
            ? `Not showing: ${idle.map((b) => b.label).join(", ")} — they are hidden or have no content yet.`
            : "Everything you have added is showing."
        } The knowledge base has ${f.knowledgeCount} entries powering the public assistant.`,
        chips: [
          { label: "Blocks", value: String(f.blocks.length) },
          { label: "Live", value: String(live.length) },
          { label: "Needs attention", value: String(idle.length) },
        ],
      };
    },
  },
  {
    id: "summary",
    keywords: ["summary", "overview", "how", "doing", "performance", "report", "month", "today", "week"],
    answer: (f) => ({
      text: `Here is the short version: ${f.views.toLocaleString("en-IN")} views, ${f.clicks} link clicks (${pct(f.clicks, f.views)}), ${f.bookings} bookings (${pct(f.bookings, f.views)}) and ${f.subscribers} subscribers. Bookings are the strongest signal — keep the services block high on the page.`,
      chips: [
        { label: "Views", value: f.views.toLocaleString("en-IN") },
        { label: "Clicks", value: String(f.clicks) },
        { label: "Bookings", value: String(f.bookings) },
        { label: "Subscribers", value: String(f.subscribers) },
      ],
    }),
  },
];

export const ACCOUNT_SUGGESTIONS = [
  "How many views did I get?",
  "Which link performs best?",
  "How are bookings going?",
  "What is not showing on my page?",
];

export function askAccount(question: string, facts: AccountFacts): AccountAnswer {
  const terms = tokenize(question);
  let best: { rule: Rule; score: number } | null = null;

  for (const rule of RULES) {
    let score = 0;
    for (const term of terms) {
      if (rule.keywords.some((k) => k === term || k.startsWith(term) || term.startsWith(k))) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) best = { rule, score };
  }

  if (!best) {
    return {
      text: "I can answer about views, link clicks, bookings, subscribers, requests, reviews, jobs, events and which blocks are live. Try one of the suggestions below.",
      chips: [],
    };
  }
  return best.rule.answer(facts);
}
