/**
 * Where published profiles live. Change this one line to move the platform.
 *
 * The demo serves a single profile at the root, so shared links and QR codes
 * point at the origin itself. In production each profile would live at
 * `${SITE_ORIGIN}/<handle>`.
 */
export const SITE_HOST = "onesite4u-platform.vercel.app";

export const SITE_ORIGIN = `https://${SITE_HOST}`;

export const ADMIN_PATH = `${SITE_HOST}/admin`;
