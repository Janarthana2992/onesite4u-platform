/**
 * The demo account's starting content and page layout. Everything here is
 * editable in the admin and the page editor; it is only a seed.
 */

import {
  DISABLED_GRIEVANCE,
  bookings as bizBookings,
  clients as bizClients,
  events as bizEvents,
  experience as bizExperience,
  gallery as bizGallery,
  jobs as bizJobs,
  knowledge as bizKnowledge,
  links as bizLinks,
  profile as bizProfile,
  reviews as bizReviews,
  services as bizServices,
  assistant as bizAssistant,
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
import { createBlock, type Block } from "@/data/blocks";


export type SeedContent = {
  profile: Profile;
  links: LinkItem[];
  services: Service[];
  gallery: { id: string; src: string; caption: string }[];
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
  /** The page layout this pack starts with. */
  blocks: Block[];
};

type Labels = Record<string, { title?: string; subtitle?: string; nav?: string }>;

/** Builds a page from block types with stable ids, applying heading overrides. */
const page = (prefix: string, types: string[], labels: Labels = {}): Block[] =>
  types.map((t, i) => createBlock(t, labels[t] ?? {}, `${prefix}-${t}-${i}`));

const seed = {
  template: "indigo-pro",
  content: {
    profile: bizProfile,
    links: bizLinks,
    services: bizServices,
    gallery: bizGallery,
    events: bizEvents,
    jobs: bizJobs,
    experience: bizExperience,
    reviews: bizReviews,
    clients: bizClients,
    knowledge: bizKnowledge,
    milestones: [],
    grievance: DISABLED_GRIEVANCE,
    requests: [],
    assistant: bizAssistant,
    blocks: page("biz", [
      "quickInfo",
      "links",
      "services",
      "assistant",
      "stats",
      "reviews",
      "experience",
      "clients",
      "faq",
      "gallery",
      "event",
      "jobs",
      "newsletter",
    ]),
  },
};


export const DEFAULT_SEED: { template: string; content: SeedContent } = seed;
