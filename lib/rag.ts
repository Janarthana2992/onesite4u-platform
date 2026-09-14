import type { Knowledge } from "@/data/mock";

/**
 * A tiny, fully local retrieval layer for the demo assistant.
 * No API calls: it scores the knowledge base by term overlap and answers
 * extractively from the best-matching entries.
 */

const STOP = new Set([
  "the","and","for","are","you","your","that","this","with","what","how","can","does","did","was",
  "were","have","has","from","about","into","who","why","when","where","will","would","should",
  "there","their","them","then","than","its","it's","our","out","not","but","all","any","get","got",
  "tell","give","need","want","know","please","hey","hello","hi","much","many","more","most","some",
]);

export const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9₹%.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((t) => t.length > 2 && !STOP.has(t));

export type Match = { entry: Knowledge; score: number };

/** Ranks knowledge entries against a question. Title and tag hits weigh more. */
export function retrieve(query: string, entries: Knowledge[], limit = 2): Match[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const scored = entries.map((entry) => {
    const title = entry.title.toLowerCase();
    const tags = entry.tags.map((t) => t.toLowerCase());
    const body = entry.content.toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 3;
      if (tags.some((t) => t.includes(term) || term.includes(t))) score += 2.5;
      const hits = body.split(term).length - 1;
      if (hits > 0) score += Math.min(hits, 3);
    }
    return { entry, score };
  });

  return scored
    .filter((m) => m.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Split on sentence ends, but not after an initial like the "T." in "T. Nagar".
const sentences = (text: string): string[] =>
  text
    .split(/(?<!\b[A-Z]\.)(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Picks the sentences from an entry that best answer the question. */
function bestSentences(query: string, entry: Knowledge, count: number): string[] {
  const terms = tokenize(query);
  const ranked = sentences(entry.content)
    .map((sentence, index) => {
      const lower = sentence.toLowerCase();
      const score = terms.reduce((sum, t) => sum + (lower.includes(t) ? 1 : 0), 0);
      return { sentence, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .sort((a, b) => a.index - b.index);

  const picked = ranked.filter((r) => r.score > 0);
  return (picked.length ? picked : ranked).map((r) => r.sentence);
}

export type Answer = {
  text: string;
  sources: Knowledge[];
  confident: boolean;
};

/** Builds an answer out of the retrieved passages, or admits it does not know. */
export function answerQuestion(query: string, entries: Knowledge[]): Answer {
  const matches = retrieve(query, entries);

  if (matches.length === 0) {
    return {
      text:
        "I could not find that in the knowledge base yet. The quickest way to get a precise answer is to book a short call, or send the question across and it will be answered personally.",
      sources: [],
      confident: false,
    };
  }

  const [top, second] = matches;
  const parts = bestSentences(query, top.entry, 3);

  if (second && second.score >= top.score * 0.6) {
    parts.push(...bestSentences(query, second.entry, 1));
  }

  return {
    text: parts.join(" "),
    sources: matches.map((m) => m.entry),
    confident: true,
  };
}
