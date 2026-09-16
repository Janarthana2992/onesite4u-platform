import { slots } from "@/data/mock";

/** Two places book appointments — the sheet and the chatbot — so the rules live here. */

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Deterministic "already taken" slots, so the calendar looks alive without a backend. */
export const isBooked = (d: Date, i: number) => (d.getDate() * 7 + d.getMonth() * 3 + i) % 4 === 0;

/** Sundays are closed. */
export const isClosed = (d: Date) => d.getDay() === 0;

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const freeSlots = (d: Date) => slots.filter((_, i) => !isBooked(d, i));

/** The next `count` open days, skipping closed ones and days with nothing free. */
export function nextOpenDays(count = 5): Date[] {
  const out: Date[] = [];
  const cursor = startOfToday();
  for (let i = 0; out.length < count && i < 45; i++) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + i);
    if (!isClosed(day) && freeSlots(day).length > 0) out.push(day);
  }
  return out;
}

export const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const fmtDayLong = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
