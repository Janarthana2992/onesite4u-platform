import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EXAMPLE_PROFILES } from "@/data/profiles";
import { profileUrl } from "@/lib/site";
import { PublicProfilePage } from "./profile-page";

const find = (handle: string) =>
  EXAMPLE_PROFILES.find((p) => p.content.profile.handle === handle.toLowerCase());

/** Every published profile is rendered ahead of time, one static page each. */
export function generateStaticParams() {
  return EXAMPLE_PROFILES.map((p) => ({ handle: p.content.profile.handle }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { handle: string } }): Metadata {
  const example = find(params.handle);
  if (!example) return { title: "Profile not found" };
  const { name, title, tagline, avatar, handle } = example.content.profile;
  return {
    title: `${name} · ${title}`,
    description: tagline,
    alternates: { canonical: profileUrl(handle) },
    openGraph: {
      title: `${name} · ${title}`,
      description: tagline,
      url: profileUrl(handle),
      images: [avatar],
      type: "profile",
    },
  };
}

export default function Page({ params }: { params: { handle: string } }) {
  const example = find(params.handle);
  if (!example) notFound();
  return <PublicProfilePage example={example} />;
}
