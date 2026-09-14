"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AssistantSettings,
  type Client,
  type EventItem,
  type ExperienceItem,
  type GrievanceConfig,
  type Job,
  type Knowledge,
  type LinkItem,
  type Milestone,
  type Profile,
  type RequestItem,
  type Review,
  type Service,
} from "@/data/mock";
import { DEFAULT_SEED } from "@/data/seed";
import { exampleById } from "@/data/profiles";
import type { Block } from "@/data/blocks";
import { DEFAULT_PROFILE_FIELDS, type ProfileFieldConfig } from "@/data/profile-fields";

export type GalleryItem = { id: string; src: string; caption: string };
export type { Profile };

export type Content = {
  /** Which example profile is loaded, for the picker's "current" state. */
  exampleId?: string;
  profile: Profile;
  /** Order and visibility of each profile row. */
  profileFields: ProfileFieldConfig[];
  links: LinkItem[];
  services: Service[];
  gallery: GalleryItem[];
  events: EventItem[];
  jobs: Job[];
  experience: ExperienceItem[];
  reviews: Review[];
  clients: Client[];
  knowledge: Knowledge[];
  milestones: Milestone[];
  grievance: GrievanceConfig;
  requests: RequestItem[];
  assistant: AssistantSettings;
};

const { blocks: _seedBlocks, ...seedContent } = DEFAULT_SEED.content;
void _seedBlocks;

export const DEFAULT_CONTENT: Content = { ...seedContent, exampleId: "consultant", profileFields: DEFAULT_PROFILE_FIELDS };

/** Keys that hold editable lists of records. */
export type ListKey =
  | "links"
  | "services"
  | "gallery"
  | "events"
  | "jobs"
  | "experience"
  | "reviews"
  | "clients"
  | "knowledge"
  | "milestones";

type Row = { id: string } & Record<string, unknown>;

const STORAGE_KEY = "os4u-content";

type ContentCtx = {
  content: Content;
  updateProfile: (patch: Partial<Profile>) => void;
  /** Loads one of the example profiles. Returns the template and page it wants. */
  applyExample: (id: string) => { template: string; blocks: Block[] };
  toggleProfileField: (key: string) => void;
  moveProfileField: (from: number, to: number) => void;
  removeProfileField: (key: string) => void;
  addProfileField: (key: string) => void;
  updateAssistant: (patch: Partial<AssistantSettings>) => void;
  updateGrievance: (patch: Partial<GrievanceConfig>) => void;
  /** Creates when `id` is absent, patches the matching row when present. */
  save: (key: ListKey, values: Record<string, unknown>, id?: string) => void;
  patch: (key: ListKey, id: string, values: Record<string, unknown>) => void;
  remove: (key: ListKey, id: string) => void;
  reset: () => void;
  isDefault: boolean;
};

const Ctx = createContext<ContentCtx>({
  content: DEFAULT_CONTENT,
  updateProfile: () => {},
  applyExample: () => ({ template: "indigo-pro", blocks: [] }),
  toggleProfileField: () => {},
  moveProfileField: () => {},
  removeProfileField: () => {},
  addProfileField: () => {},
  updateAssistant: () => {},
  updateGrievance: () => {},
  save: () => {},
  patch: () => {},
  remove: () => {},
  reset: () => {},
  isDefault: true,
});

export const useContent = () => useContext(Ctx);

/** Blank record used when a new row is created from the admin editor. */
const BLANKS: Record<ListKey, Record<string, unknown>> = {
  links: { title: "", subtitle: "", url: "", icon: "portfolio", clicks: 0, visible: true },
  services: { name: "", price: 0, duration: "60 min", description: "", bookings: 0 },
  gallery: { src: "https://picsum.photos/seed/os4u-new/600/600", caption: "" },
  events: {
    title: "",
    date: "",
    day: "—",
    month: "TBD",
    time: "",
    venue: "",
    attendees: 0,
    price: "Free entry",
    description: "",
    cover: "https://picsum.photos/seed/os4u-new-event/900/500",
  },
  jobs: { title: "", type: "", location: "", pay: "", tags: [], posted: "Just now", applicants: 0, open: true },
  experience: { role: "", company: "", period: "", location: "", description: "" },
  reviews: { author: "", role: "", avatar: "https://i.pravatar.cc/128?img=5", rating: 5, text: "", date: "Just now" },
  clients: { name: "", initials: "", industry: "", since: "" },
  knowledge: { title: "", content: "", tags: [] },
  milestones: { title: "", description: "", status: "planned", progress: 0, meta: "" },
};

export function ContentProvider({
  children,
  fixed,
}: {
  children: ReactNode;
  /** Pins the provider to one profile: no storage is read or written. */
  fixed?: Content;
}) {
  const [content, setContent] = useState<Content>(fixed ?? DEFAULT_CONTENT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (fixed) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Content>;
        setContent({
          ...DEFAULT_CONTENT,
          ...saved,
          profileFields: saved.profileFields?.length ? saved.profileFields : DEFAULT_PROFILE_FIELDS,
        });
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [fixed]);

  // Persist after the state settles so back-to-back edits cannot clobber each other.
  useEffect(() => {
    if (fixed || !hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      /* storage may be unavailable */
    }
  }, [content, hydrated, fixed]);

  const updateProfile = useCallback(
    (p: Partial<Profile>) => setContent((c) => ({ ...c, profile: { ...c.profile, ...p } })),
    [],
  );

  const applyExample = useCallback((id: string) => {
    const example = exampleById(id);
    const { blocks, ...rest } = example.content;
    setContent({ ...rest, exampleId: example.id, profileFields: DEFAULT_PROFILE_FIELDS });
    return { template: example.template, blocks };
  }, []);

  const toggleProfileField = useCallback((key: string) => {
    setContent((c) => ({
      ...c,
      profileFields: c.profileFields.map((f) => (f.key === key ? { ...f, visible: !f.visible } : f)),
    }));
  }, []);

  const moveProfileField = useCallback((from: number, to: number) => {
    setContent((c) => {
      const list = [...c.profileFields];
      if (from < 0 || from >= list.length) return c;
      const [moved] = list.splice(from, 1);
      list.splice(Math.max(0, Math.min(list.length, to)), 0, moved);
      return { ...c, profileFields: list };
    });
  }, []);

  const removeProfileField = useCallback((key: string) => {
    setContent((c) => ({ ...c, profileFields: c.profileFields.filter((f) => f.key !== key) }));
  }, []);

  const addProfileField = useCallback((key: string) => {
    setContent((c) =>
      c.profileFields.some((f) => f.key === key)
        ? c
        : { ...c, profileFields: [...c.profileFields, { key, visible: true }] },
    );
  }, []);

  const updateAssistant = useCallback(
    (p: Partial<AssistantSettings>) => setContent((c) => ({ ...c, assistant: { ...c.assistant, ...p } })),
    [],
  );

  const updateGrievance = useCallback(
    (p: Partial<GrievanceConfig>) => setContent((c) => ({ ...c, grievance: { ...c.grievance, ...p } })),
    [],
  );

  const save = useCallback((key: ListKey, values: Record<string, unknown>, id?: string) => {
    setContent((c) => {
      const list = c[key] as unknown as Row[];
      const next = id
        ? list.map((row) => (row.id === id ? { ...row, ...values } : row))
        : [
            ...list,
            { id: `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...BLANKS[key], ...values } as Row,
          ];
      return { ...c, [key]: next } as Content;
    });
  }, []);

  const patch = useCallback(
    (key: ListKey, id: string, values: Record<string, unknown>) => save(key, values, id),
    [save],
  );

  const remove = useCallback((key: ListKey, id: string) => {
    setContent((c) => {
      const list = c[key] as unknown as Row[];
      return { ...c, [key]: list.filter((row) => row.id !== id) } as Content;
    });
  }, []);

  const reset = useCallback(() => setContent(DEFAULT_CONTENT), []);

  const isDefault = useMemo(
    () => JSON.stringify(content) === JSON.stringify(DEFAULT_CONTENT),
    [content],
  );

  const value = useMemo(
    () => ({
      content,
      updateProfile,
      applyExample,
      toggleProfileField,
      moveProfileField,
      removeProfileField,
      addProfileField,
      updateAssistant,
      updateGrievance,
      save,
      patch,
      remove,
      reset,
      isDefault,
    }),
    [
      content,
      updateProfile,
      applyExample,
      toggleProfileField,
      moveProfileField,
      removeProfileField,
      addProfileField,
      toggleProfileField,
      moveProfileField,
      removeProfileField,
      addProfileField,
      updateAssistant,
      updateGrievance,
      save,
      patch,
      remove,
      reset,
      isDefault,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

