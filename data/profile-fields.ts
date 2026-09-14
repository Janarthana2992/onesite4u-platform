/**
 * The profile is edited field by field: each row can be reordered, hidden or
 * cleared independently, the way a résumé builder works.
 */

export type FieldGroup = "header" | "contact";

export type ProfileFieldDef = {
  key: string;
  label: string;
  group: FieldGroup;
  /** Which key on `profile` this edits. Absent for composite rows. */
  path?: string;
  type: "text" | "textarea" | "image" | "composite";
  placeholder?: string;
  hint?: string;
};

export const PROFILE_FIELDS: ProfileFieldDef[] = [
  { key: "avatar", label: "Avatar", group: "header", path: "avatar", type: "image" },
  { key: "name", label: "Name", group: "header", path: "name", type: "text", placeholder: "Your name" },
  { key: "title", label: "Title", group: "header", path: "title", type: "text", placeholder: "What you do" },
  { key: "tagline", label: "Tagline", group: "header", path: "tagline", type: "textarea", placeholder: "One line about your work" },
  { key: "status", label: "Status chip", group: "header", path: "responseNote", type: "text", placeholder: "Replies in ~2 hrs" },
  { key: "org", label: "Organisation", group: "header", type: "composite", hint: "Name, note and monogram" },
  { key: "stats", label: "Highlight numbers", group: "header", type: "composite", hint: "Three figures under the header" },
  { key: "phone", label: "Phone", group: "contact", path: "phone", type: "text", placeholder: "+91 " },
  { key: "email", label: "Email", group: "contact", path: "email", type: "text", placeholder: "you@email.com" },
  { key: "website", label: "Website", group: "contact", path: "website", type: "text", placeholder: "example.com" },
  { key: "location", label: "Location", group: "contact", path: "location", type: "text", placeholder: "City, Country" },
];

export const profileFieldDef = (key: string) => PROFILE_FIELDS.find((f) => f.key === key);

export type ProfileFieldConfig = { key: string; visible: boolean };

export const DEFAULT_PROFILE_FIELDS: ProfileFieldConfig[] = PROFILE_FIELDS.map((f) => ({
  key: f.key,
  visible: true,
}));

/** A few ready-made avatars so the picker works without a real upload. */
export const AVATAR_PRESETS = [
  "https://i.pravatar.cc/300?img=47",
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=32",
  "https://i.pravatar.cc/300?img=13",
  "https://i.pravatar.cc/300?img=44",
  "https://i.pravatar.cc/300?img=68",
];
