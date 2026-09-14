import { getDef, type Block } from "@/data/blocks";
import type { Content } from "@/components/content-store";

/** Whether a block has anything to show. Empty blocks are skipped on the live page. */
export function blockHasContent(block: Block, content: Content): boolean {
  const def = getDef(block.type);
  if (!def) return false;
  if (def.special === "profile") {
    const p = content.profile;
    return Boolean(p.phone || p.email || p.website || p.location);
  }
  if (def.special === "grievance") return content.grievance.enabled && content.grievance.categories.length > 0;
  if (def.special === "assistant") return content.assistant.enabled && content.knowledge.length > 0;
  if (def.special === "newsletter") return true;
  if (def.collection) {
    const list = (content as unknown as Record<string, unknown[]>)[def.collection] ?? [];
    if (def.collection === "links") return (list as { visible: boolean }[]).some((l) => l.visible);
    if (def.collection === "jobs") return (list as { open: boolean }[]).some((j) => j.open);
    return list.length > 0;
  }
  if (def.contentKey) {
    const v = block.props[def.contentKey];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" ? v.trim().length > 0 : Boolean(v);
  }
  return true;
}

