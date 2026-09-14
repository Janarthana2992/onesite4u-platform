"use client";

import { ContentProvider, type Content } from "@/components/content-store";
import { DesignProvider, designFromTemplate } from "@/components/design-store";
import { ProfileView } from "@/components/profile-view";
import { DEFAULT_PROFILE_FIELDS } from "@/data/profile-fields";
import type { ExampleProfile } from "@/data/profiles";

/**
 * A published profile. Content and design are pinned to this person, so the
 * page a QR code opens never depends on what the visitor last edited.
 */
export function PublicProfilePage({ example }: { example: ExampleProfile }) {
  const { blocks, ...rest } = example.content;
  const content: Content = { ...rest, exampleId: example.id, profileFields: DEFAULT_PROFILE_FIELDS };

  return (
    <DesignProvider fixed={designFromTemplate(example.template, blocks)}>
      <ContentProvider fixed={content}>
        <ProfileView />
      </ContentProvider>
    </DesignProvider>
  );
}
