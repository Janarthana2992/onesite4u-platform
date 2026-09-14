/**
 * Where published profiles live. Change this one line to move the platform.
 *
 * Each profile is served at `/<handle>`, so share links and QR codes resolve to
 * that person's page rather than whatever the visitor last had open.
 */
export const SITE_HOST = "onesite4u-platform.vercel.app";

export const SITE_ORIGIN = `https://${SITE_HOST}`;

/** The link a QR code encodes and the share sheet copies. */
export const profileUrl = (handle: string) => `${SITE_ORIGIN}/${handle}`;

/** The same link without the scheme, for display under a QR code. */
export const profileLabel = (handle: string) => `${SITE_HOST}/${handle}`;

export const ADMIN_PATH = `${SITE_HOST}/admin`;
