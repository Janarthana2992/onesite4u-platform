/* Design-system data for the customizer. Pure UI config — no backend. */

export type Palette = { id: string; name: string; hex: string; rgb: string[] };

/** Stops are ordered 50,100,200,300,400,500,600,700,800,900 as "R G B" triplets. */
export const PALETTES: Palette[] = [
  {
    id: "indigo",
    name: "Indigo",
    hex: "#4f46e5",
    rgb: ["238 242 255","224 231 255","199 210 254","165 180 252","129 140 248","99 102 241","79 70 229","67 56 202","55 48 163","49 46 129"],
  },
  {
    id: "violet",
    name: "Violet",
    hex: "#7c3aed",
    rgb: ["245 243 255","237 233 254","221 214 254","196 181 253","167 139 250","139 92 246","124 58 237","109 40 217","91 33 182","76 29 149"],
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    hex: "#c026d3",
    rgb: ["253 244 255","250 232 255","245 208 254","240 171 252","232 121 249","217 70 239","192 38 211","162 28 175","134 25 143","112 26 117"],
  },
  {
    id: "rose",
    name: "Rose",
    hex: "#e11d48",
    rgb: ["255 241 242","255 228 230","254 205 211","253 164 175","251 113 133","244 63 94","225 29 72","190 18 60","159 18 57","136 19 55"],
  },
  {
    id: "orange",
    name: "Sunset",
    hex: "#ea580c",
    rgb: ["255 247 237","255 237 213","254 215 170","253 186 116","251 146 60","249 115 22","234 88 12","194 65 12","154 52 18","124 45 18"],
  },
  {
    id: "amber",
    name: "Amber",
    hex: "#d97706",
    rgb: ["255 251 235","254 243 199","253 230 138","252 211 77","251 191 36","245 158 11","217 119 6","180 83 9","146 64 14","120 53 15"],
  },
  {
    id: "emerald",
    name: "Emerald",
    hex: "#059669",
    rgb: ["236 253 245","209 250 229","167 243 208","110 231 183","52 211 153","16 185 129","5 150 105","4 120 87","6 95 70","6 78 59"],
  },
  {
    id: "teal",
    name: "Teal",
    hex: "#0d9488",
    rgb: ["240 253 250","204 251 241","153 246 228","94 234 212","45 212 191","20 184 166","13 148 136","15 118 110","17 94 89","19 78 74"],
  },
  {
    id: "cyan",
    name: "Cyan",
    hex: "#0891b2",
    rgb: ["236 254 255","207 250 254","165 243 252","103 232 249","34 211 238","6 182 212","8 145 178","14 116 144","21 94 117","22 78 99"],
  },
  {
    id: "blue",
    name: "Blue",
    hex: "#2563eb",
    rgb: ["239 246 255","219 234 254","191 219 254","147 197 253","96 165 250","59 130 246","37 99 235","29 78 216","30 64 175","30 58 138"],
  },
  {
    id: "lime",
    name: "Lime",
    hex: "#65a30d",
    rgb: ["247 254 231","236 252 203","217 249 157","190 242 100","163 230 53","132 204 22","101 163 13","77 124 15","63 98 18","54 83 20"],
  },
  {
    id: "slate",
    name: "Graphite",
    hex: "#334155",
    rgb: ["248 250 252","241 245 249","226 232 240","203 213 225","148 163 184","100 116 139","71 85 105","51 65 85","30 41 59","15 23 42"],
  },
];

export const paletteById = (id: string) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];

/* ---------------- Font pairings ---------------- */

export type FontPair = { id: string; name: string; head: string; body: string; note: string };

const stack = (name: string, fallback = "ui-sans-serif, system-ui, sans-serif") => `"${name}", ${fallback}`;

export const FONTS: FontPair[] = [
  { id: "modern", name: "Modern", head: stack("Plus Jakarta Sans"), body: stack("Inter"), note: "Plus Jakarta + Inter" },
  { id: "editorial", name: "Editorial", head: stack("Playfair Display", "Georgia, serif"), body: stack("Inter"), note: "Playfair + Inter" },
  { id: "geometric", name: "Geometric", head: stack("Poppins"), body: stack("Poppins"), note: "Poppins" },
  { id: "technical", name: "Technical", head: stack("Space Grotesk"), body: stack("Inter"), note: "Space Grotesk + Inter" },
  { id: "luxury", name: "Luxury", head: stack("DM Serif Display", "Georgia, serif"), body: stack("Manrope"), note: "DM Serif + Manrope" },
  { id: "soft", name: "Soft", head: stack("Sora"), body: stack("Manrope"), note: "Sora + Manrope" },
  { id: "mono", name: "Mono", head: stack("JetBrains Mono", "ui-monospace, monospace"), body: stack("Inter"), note: "JetBrains Mono + Inter" },
];

export const fontById = (id: string) => FONTS.find((f) => f.id === id) ?? FONTS[0];

/* ---------------- Corner radius ---------------- */

export type RadiusPreset = { id: string; name: string; lg: string; xl: string; xxl: string; xxxl: string };

export const RADII: RadiusPreset[] = [
  { id: "sharp", name: "Sharp", lg: "0.25rem", xl: "0.375rem", xxl: "0.5rem", xxxl: "0.75rem" },
  { id: "soft", name: "Soft", lg: "0.5rem", xl: "0.75rem", xxl: "1rem", xxxl: "1.5rem" },
  { id: "round", name: "Round", lg: "0.75rem", xl: "1rem", xxl: "1.35rem", xxxl: "2rem" },
];

export const radiusById = (id: string) => RADII.find((r) => r.id === id) ?? RADII[1];

export const BUTTON_SHAPES = [
  { id: "rounded", name: "Rounded", radius: "" },
  { id: "pill", name: "Pill", radius: "9999px" },
  { id: "square", name: "Square", radius: "0.25rem" },
] as const;

export type ButtonShape = (typeof BUTTON_SHAPES)[number]["id"];

export const CARD_STYLES = [
  { id: "soft", name: "Soft" },
  { id: "outlined", name: "Outlined" },
  { id: "elevated", name: "Elevated" },
  { id: "flat", name: "Flat" },
] as const;

export type CardStyle = (typeof CARD_STYLES)[number]["id"];

/* ---------------- Banners (LinkedIn-style cover) ---------------- */

export type Banner = {
  id: string;
  name: string;
  kind: "gradient" | "photo";
  css?: string;
  url?: string;
  /** Tint strength over a photo, 0–100. */
  tint?: number;
};

export const BANNERS: Banner[] = [
  {
    id: "brand",
    name: "Brand",
    kind: "gradient",
    css: "linear-gradient(135deg, rgb(var(--c-700)) 0%, rgb(var(--c-500)) 45%, rgb(var(--a-500)) 100%)",
  },
  {
    id: "aurora",
    name: "Aurora",
    kind: "gradient",
    css: "radial-gradient(circle at 12% 18%, rgb(var(--a-400)) 0%, transparent 45%), radial-gradient(circle at 88% 8%, rgb(var(--c-300)) 0%, transparent 40%), linear-gradient(160deg, rgb(var(--c-800)), rgb(var(--a-700)))",
  },
  {
    id: "mesh",
    name: "Mesh",
    kind: "gradient",
    css: "radial-gradient(at 20% 20%, rgb(var(--c-400)) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(var(--a-300)) 0px, transparent 50%), radial-gradient(at 70% 90%, rgb(var(--c-600)) 0px, transparent 50%), linear-gradient(120deg, rgb(var(--c-600)), rgb(var(--a-600)))",
  },
  {
    id: "duotone",
    name: "Duotone",
    kind: "gradient",
    css: "linear-gradient(100deg, rgb(var(--c-900)) 0%, rgb(var(--c-900)) 38%, rgb(var(--a-500)) 38%, rgb(var(--a-400)) 100%)",
  },
  {
    id: "stripes",
    name: "Stripes",
    kind: "gradient",
    css: "repeating-linear-gradient(115deg, rgb(var(--c-700)) 0px, rgb(var(--c-700)) 22px, rgb(var(--c-600)) 22px, rgb(var(--c-600)) 44px)",
  },
  {
    id: "tint",
    name: "Soft tint",
    kind: "gradient",
    css: "linear-gradient(135deg, rgb(var(--c-100)), rgb(var(--a-100)))",
  },
  { id: "office", name: "Office", kind: "photo", url: "https://picsum.photos/seed/os4u-cover-office/1200/420", tint: 45 },
  { id: "city", name: "Skyline", kind: "photo", url: "https://picsum.photos/seed/os4u-cover-city/1200/420", tint: 40 },
  { id: "desk", name: "Desk", kind: "photo", url: "https://picsum.photos/seed/os4u-cover-desk/1200/420", tint: 35 },
  { id: "stage", name: "On stage", kind: "photo", url: "https://picsum.photos/seed/os4u-cover-stage/1200/420", tint: 50 },
];

export const bannerById = (id: string) => BANNERS.find((b) => b.id === id) ?? BANNERS[0];

/* ---------------- Sections (compat shim over the block registry) ---------------- */

import { BLOCK_DEFS, createBlock, type Block } from "@/data/blocks";

export type SectionId = string;

export const SECTION_META: Record<string, { label: string; desc: string; source: string }> = Object.fromEntries(
  BLOCK_DEFS.map((d) => [
    d.type,
    {
      label: d.label,
      desc: d.desc,
      source: d.collection ? `${d.label} tab` : d.special === "profile" ? "Profile tab" : "the block's settings",
    },
  ]),
);

export const SECTION_IDS = BLOCK_DEFS.map((d) => d.type);

export type SectionConfig = { id: SectionId; visible: boolean };

/** The page a brand-new account starts with. */
export const DEFAULT_BLOCKS: Block[] = [
  "quickInfo",
  "links",
  "services",
  "assistant",
  "reviews",
  "experience",
  "clients",
  "gallery",
  "event",
  "jobs",
  "newsletter",
].map((t) => createBlock(t));

/* ---------------- Templates ---------------- */

export type Template = {
  id: string;
  name: string;
  tagline: string;
  palette: string;
  accent: string;
  font: string;
  radius: string;
  banner: string;
  card: CardStyle;
  button: ButtonShape;
};

export const TEMPLATES: Template[] = [
  {
    id: "indigo-pro",
    name: "Indigo Pro",
    tagline: "Trusted, corporate, versatile",
    palette: "indigo",
    accent: "violet",
    font: "modern",
    radius: "soft",
    banner: "brand",
    card: "soft",
    button: "rounded",
  },
  {
    id: "sunset-bold",
    name: "Sunset Bold",
    tagline: "Loud, friendly, creator-first",
    palette: "orange",
    accent: "rose",
    font: "geometric",
    radius: "round",
    banner: "mesh",
    card: "elevated",
    button: "pill",
  },
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Serif headlines, magazine calm",
    palette: "amber",
    accent: "slate",
    font: "editorial",
    radius: "sharp",
    banner: "office",
    card: "outlined",
    button: "square",
  },
  {
    id: "ocean",
    name: "Ocean Calm",
    tagline: "Cool, technical, product-led",
    palette: "cyan",
    accent: "blue",
    font: "technical",
    radius: "soft",
    banner: "aurora",
    card: "soft",
    button: "rounded",
  },
  {
    id: "forest",
    name: "Forest",
    tagline: "Grounded, sustainable, calm",
    palette: "emerald",
    accent: "teal",
    font: "soft",
    radius: "round",
    banner: "duotone",
    card: "flat",
    button: "pill",
  },
  {
    id: "mono",
    name: "Mono Minimal",
    tagline: "Stark, technical, portfolio",
    palette: "slate",
    accent: "lime",
    font: "mono",
    radius: "sharp",
    banner: "stripes",
    card: "outlined",
    button: "square",
  },
  {
    id: "rose-luxe",
    name: "Rose Luxe",
    tagline: "Premium, boutique, personal",
    palette: "rose",
    accent: "fuchsia",
    font: "luxury",
    radius: "round",
    banner: "tint",
    card: "elevated",
    button: "rounded",
  },
];

export const templateById = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
