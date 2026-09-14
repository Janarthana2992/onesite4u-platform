/**
 * Turns an uploaded document into knowledge-base entries, entirely in the
 * browser. Plain-text formats are read for real; binary formats are described
 * rather than parsed, since the demo has no server to run an extractor.
 */

const READABLE = /\.(txt|md|markdown|csv|json|log|rtf)$/i;

const STOP = new Set([
  "the","and","for","are","you","your","that","this","with","from","have","has","was","were","will",
  "not","but","all","any","our","their","its","can","also","into","when","what","which","they","them",
]);

/** Picks the words that best identify a chunk, for retrieval tags. */
function keywords(text: string, limit = 6): string[] {
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

/** Splits text into passages that are big enough to answer from, small enough to rank. */
export function chunk(text: string, target = 700): string[] {
  const paragraphs = text
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const out: string[] = [];
  let buffer = "";
  for (const p of paragraphs) {
    if (buffer && buffer.length + p.length > target) {
      out.push(buffer);
      buffer = p;
    } else {
      buffer = buffer ? `${buffer} ${p}` : p;
    }
  }
  if (buffer) out.push(buffer);
  return out.length ? out : [];
}

export type IngestResult = {
  entries: { title: string; content: string; tags: string[]; source: string }[];
  note: string;
};

export async function ingestFile(file: File): Promise<IngestResult> {
  const name = file.name;

  if (!READABLE.test(name)) {
    // No extractor in the browser — record the document so the demo stays honest.
    return {
      entries: [
        {
          title: `${name} (summary)`,
          content: `This entry stands in for the uploaded document ${name} (${Math.round(file.size / 1024)} KB). In the demo, binary formats such as PDF and Word are not parsed in the browser, so replace this text with the passages you want the assistant to answer from.`,
          tags: keywords(name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")),
          source: name,
        },
      ],
      note: `${name} was added as a single placeholder entry — edit it to paste the real text.`,
    };
  }

  const text = await file.text();
  const parts = chunk(text);
  if (parts.length === 0) {
    return { entries: [], note: `${name} looked empty, so nothing was added.` };
  }

  return {
    entries: parts.map((content, i) => ({
      title: parts.length === 1 ? name : `${name} · part ${i + 1}`,
      content,
      tags: keywords(content),
      source: name,
    })),
    note: `${name} split into ${parts.length} entr${parts.length === 1 ? "y" : "ies"}.`,
  };
}
