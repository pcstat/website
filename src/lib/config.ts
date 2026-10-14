/**
 * Build-time / runtime configuration.
 *
 * Both values can be overridden with environment variables (see `.env.example`); the defaults
 * keep the demo deployment working with zero configuration.
 *
 * NOTE: `process.env.NEXT_PUBLIC_*` must be written out literally so Next.js can inline it
 * into the browser bundle.
 */

/** Public address of the website. Used for canonical / Open Graph metadata. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pcstat.org';

/**
 * Absolute URL of the database's `database.json` index (published by the database repo).
 * Everything the website shows comes from the files this index points to.
 */
export const DATABASE_INDEX_URL =
  process.env.NEXT_PUBLIC_DATABASE_INDEX_URL ??
  'https://programming-club-demo-data.pages.dev/database.json';
