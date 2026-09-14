"use client";

import {
  createContext,
  useReducer,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import {
  bannerById,
  fontById,
  paletteById,
  radiusById,
  templateById,
  type ButtonShape,
  type CardStyle,
} from "@/data/design";
import { createBlock, getDef, newBlockId, type Block } from "@/data/blocks";
import { DEFAULT_SEED } from "@/data/seed";

export type Design = {
  templateId: string;
  paletteId: string;
  accentId: string;
  fontId: string;
  radiusId: string;
  bannerId: string;
  cardStyle: CardStyle;
  buttonShape: ButtonShape;
  showBanner: boolean;
  showStats: boolean;
  showAvailability: boolean;
  lineHeight: number;
  baseFontSize: number;
  avatarAlign: "left" | "center" | "right";
  blocks: Block[];
};

export const DEFAULT_DESIGN: Design = {
  templateId: "indigo-pro",
  paletteId: "indigo",
  accentId: "violet",
  fontId: "modern",
  radiusId: "soft",
  bannerId: "brand",
  cardStyle: "soft",
  buttonShape: "rounded",
  showBanner: true,
  showStats: true,
  showAvailability: true,
  lineHeight: 1.6,
  baseFontSize: 16,
  avatarAlign: "left",
  blocks: DEFAULT_SEED.content.blocks,
};

const STORAGE_KEY = "os4u-design-v2";

/** Drops blocks whose type no longer exists in the registry and back-fills defaults. */
function normalize(design: Design): Design {
  const blocks = (design.blocks ?? [])
    .filter((b) => getDef(b.type))
    .map((b) => ({ ...b, props: { ...getDef(b.type)!.defaults, ...b.props } }));
  return { ...design, blocks };
}

type DesignCtx = {
  design: Design;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  update: (patch: Partial<Design>) => void;
  applyTemplate: (id: string) => void;
  toggleBlock: (id: string) => void;
  moveBlock: (id: string, dir: -1 | 1) => void;
  /** Moves a block to an arbitrary index (drag and drop). */
  reorderBlock: (id: string, toIndex: number) => void;
  /** Adds a block of `type`; at `index` when given, else at the end. Returns its id. */
  addBlock: (type: string, index?: number) => string;
  duplicateBlock: (id: string) => string | null;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, patch: Record<string, unknown>) => void;
  setBlocks: (blocks: Block[]) => void;
  reset: () => void;
  isDefault: boolean;
};

const Ctx = createContext<DesignCtx>({
  design: DEFAULT_DESIGN,
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  update: () => {},
  applyTemplate: () => {},
  toggleBlock: () => {},
  moveBlock: () => {},
  reorderBlock: () => {},
  addBlock: () => "",
  duplicateBlock: () => null,
  removeBlock: () => {},
  updateBlock: () => {},
  setBlocks: () => {},
  reset: () => {},
  isDefault: true,
});

export const useDesign = () => useContext(Ctx);

type HistoryState = { design: Design; past: Design[]; future: Design[] };

type HistoryAction =
  | { type: "apply"; fn: (d: Design) => Design }
  | { type: "load"; design: Design }
  | { type: "undo" }
  | { type: "redo" };

const LIMIT = 60;

/** Pure reducer so undo/redo stays correct under React's double-invoked updates. */
function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "apply": {
      const next = action.fn(state.design);
      if (next === state.design) return state;
      return { design: next, past: [...state.past, state.design].slice(-LIMIT), future: [] };
    }
    case "load":
      return { design: action.design, past: [], future: [] };
    case "undo": {
      const prev = state.past[state.past.length - 1];
      if (!prev) return state;
      return { design: prev, past: state.past.slice(0, -1), future: [state.design, ...state.future].slice(0, LIMIT) };
    }
    case "redo": {
      const [next, ...rest] = state.future;
      if (!next) return state;
      return { design: next, past: [...state.past, state.design].slice(-LIMIT), future: rest };
    }
  }
}

/** Builds a full design from a template id and a page, without touching storage. */
export function designFromTemplate(templateId: string, blocks: Block[]): Design {
  const t = templateById(templateId);
  return {
    ...DEFAULT_DESIGN,
    templateId: t.id,
    paletteId: t.palette,
    accentId: t.accent,
    fontId: t.font,
    radiusId: t.radius,
    bannerId: t.banner,
    cardStyle: t.card,
    buttonShape: t.button,
    blocks,
  };
}

export function DesignProvider({
  children,
  fixed,
}: {
  children: ReactNode;
  /** Pins the provider to one design: no storage is read or written. */
  fixed?: Design;
}) {
  const [state, dispatch] = useReducer(historyReducer, {
    design: fixed ?? DEFAULT_DESIGN,
    past: [],
    future: [],
  });
  const design = state.design;
  const setDesign = useCallback(
    (fn: Design | ((d: Design) => Design)) =>
      dispatch({ type: "apply", fn: typeof fn === "function" ? (fn as (d: Design) => Design) : () => fn }),
    [],
  );
  const [hydrated, setHydrated] = useState(false);

  // Read saved design after mount so server and client markup match.
  useEffect(() => {
    if (fixed) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "load", design: normalize({ ...DEFAULT_DESIGN, ...JSON.parse(raw) }) });
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [fixed]);

  // Persist after the state settles so back-to-back edits cannot clobber each other.
  useEffect(() => {
    if (fixed || !hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    } catch {
      /* storage may be unavailable */
    }
  }, [design, hydrated, fixed]);

  const update = useCallback((patch: Partial<Design>) => setDesign((d) => ({ ...d, ...patch })), []);

  const applyTemplate = useCallback((id: string) => {
    const t = templateById(id);
    setDesign((d) => ({
      ...d,
      templateId: t.id,
      paletteId: t.palette,
      accentId: t.accent,
      fontId: t.font,
      radiusId: t.radius,
      bannerId: t.banner,
      cardStyle: t.card,
      buttonShape: t.button,
    }));
  }, []);

  const toggleBlock = useCallback(
    (id: string) =>
      setDesign((d) => ({
        ...d,
        blocks: d.blocks.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
      })),
    [],
  );

  const moveBlock = useCallback((id: string, dir: -1 | 1) => {
    setDesign((d) => {
      const list = [...d.blocks];
      const i = list.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return d;
      [list[i], list[j]] = [list[j], list[i]];
      return { ...d, blocks: list };
    });
  }, []);

  const reorderBlock = useCallback((id: string, toIndex: number) => {
    setDesign((d) => {
      const from = d.blocks.findIndex((b) => b.id === id);
      if (from < 0) return d;
      const list = [...d.blocks];
      const [moved] = list.splice(from, 1);
      // Removing the item shifts everything after it up by one.
      const target = Math.max(0, Math.min(list.length, toIndex > from ? toIndex - 1 : toIndex));
      list.splice(target, 0, moved);
      return { ...d, blocks: list };
    });
  }, []);

  const addBlock = useCallback((type: string, index?: number) => {
    const block = createBlock(type);
    setDesign((d) => {
      const def = getDef(type);
      if (!def) return d;
      if (!def.multi && d.blocks.some((b) => b.type === type)) return d;
      const list = [...d.blocks];
      list.splice(index === undefined ? list.length : Math.max(0, Math.min(list.length, index)), 0, block);
      return { ...d, blocks: list };
    });
    return block.id;
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    let created: string | null = null;
    setDesign((d) => {
      const i = d.blocks.findIndex((b) => b.id === id);
      if (i < 0) return d;
      const src = d.blocks[i];
      const def = getDef(src.type);
      if (!def?.multi) return d;
      const copy: Block = { ...src, id: newBlockId(src.type), props: JSON.parse(JSON.stringify(src.props)) };
      created = copy.id;
      const list = [...d.blocks];
      list.splice(i + 1, 0, copy);
      return { ...d, blocks: list };
    });
    return created;
  }, []);

  const removeBlock = useCallback((id: string) => {
    setDesign((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
  }, []);

  const updateBlock = useCallback((id: string, patch: Record<string, unknown>) => {
    setDesign((d) => ({
      ...d,
      blocks: d.blocks.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...patch } } : b)),
    }));
  }, []);

  const setBlocks = useCallback((blocks: Block[]) => setDesign((d) => ({ ...d, blocks })), []);

  const reset = useCallback(() => setDesign(DEFAULT_DESIGN), []);

  const isDefault = useMemo(
    () => JSON.stringify(design) === JSON.stringify(DEFAULT_DESIGN),
    [design],
  );

  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  const value = useMemo(
    () => ({
      design,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
      update,
      applyTemplate,
      toggleBlock,
      moveBlock,
      reorderBlock,
      addBlock,
      duplicateBlock,
      removeBlock,
      updateBlock,
      setBlocks,
      reset,
      isDefault,
    }),
    [
      design,
      undo,
      redo,
      state.past.length,
      state.future.length,
      update,
      applyTemplate,
      toggleBlock,
      moveBlock,
      reorderBlock,
      addBlock,
      duplicateBlock,
      removeBlock,
      updateBlock,
      setBlocks,
      reset,
      isDefault,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/* ---------------- CSS variables ---------------- */

export function designVars(design: Design): CSSProperties {
  const primary = paletteById(design.paletteId);
  const accent = paletteById(design.accentId);
  const font = fontById(design.fontId);
  const radius = radiusById(design.radiusId);
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  const vars: Record<string, string> = {
    "--font-head": font.head,
    "--font-body": font.body,
    "--r-lg": radius.lg,
    "--r-xl": radius.xl,
    "--r-2xl": radius.xxl,
    "--r-3xl": radius.xxxl,
    "--r-btn":
      design.buttonShape === "pill" ? "9999px" : design.buttonShape === "square" ? "0.25rem" : radius.xl,
    "--os-leading": String(design.lineHeight ?? 1.6),
    "--os-base": `${design.baseFontSize ?? 16}px`,
  };
  stops.forEach((s, i) => {
    vars[`--c-${s}`] = primary.rgb[i];
    vars[`--a-${s}`] = accent.rgb[i];
  });
  return vars as CSSProperties;
}

/** Applies the current design as scoped CSS variables. */
export function DesignScope({
  children,
  className,
  style,
  framed,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  framed?: boolean;
}) {
  const { design } = useDesign();
  return (
    <div
      className={className}
      style={{ ...designVars(design), ...style }}
      data-card={design.cardStyle}
      data-framed={framed ? "1" : undefined}
    >
      {children}
    </div>
  );
}

export function bannerStyle(bannerId: string): CSSProperties {
  const b = bannerById(bannerId);
  if (b.kind === "photo") return {};
  return { backgroundImage: b.css };
}

/* ---------------- Scroll scope ---------------- */

type ScrollCtx = { contained: boolean; ref: RefObject<HTMLElement> | null };
const Scroll = createContext<ScrollCtx>({ contained: false, ref: null });

export function ScrollScopeProvider({
  contained,
  scrollRef,
  children,
}: {
  contained: boolean;
  scrollRef: RefObject<HTMLElement> | null;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ contained, ref: scrollRef }), [contained, scrollRef]);
  return <Scroll.Provider value={value}>{children}</Scroll.Provider>;
}

/** Scroll helpers that work both on the page and inside a device frame. */
export function useScrollScope() {
  const { contained, ref } = useContext(Scroll);
  const latest = useRef(ref);
  latest.current = ref;

  const getEl = useCallback(() => (contained ? latest.current?.current ?? null : null), [contained]);

  const scrollToTop = useCallback(() => {
    const el = getEl();
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  }, [getEl]);

  const scrollToId = useCallback(
    (id: string) => {
      const target = (getEl() ?? document).querySelector<HTMLElement>(`#${id}`);
      if (!target) return;
      const el = getEl();
      if (el) el.scrollTo({ top: Math.max(0, target.offsetTop - 12), behavior: "smooth" });
      else
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 12,
          behavior: "smooth",
        });
    },
    [getEl],
  );

  const onScroll = useCallback(
    (handler: () => void) => {
      const el = getEl();
      const target: HTMLElement | Window = el ?? window;
      target.addEventListener("scroll", handler, { passive: true });
      handler();
      return () => target.removeEventListener("scroll", handler);
    },
    [getEl],
  );

  /** Viewport rectangle used to decide which section is active. */
  const viewportTop = useCallback(() => {
    const el = getEl();
    return el ? el.getBoundingClientRect().top : 0;
  }, [getEl]);

  const viewportHeight = useCallback(() => {
    const el = getEl();
    return el ? el.clientHeight : window.innerHeight;
  }, [getEl]);

  return { contained, getEl, scrollToTop, scrollToId, onScroll, viewportTop, viewportHeight };
}
