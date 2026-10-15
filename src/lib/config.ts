/**
 * Build-time / runtime configuration.
 *
 * Where the database lives is configured in `database.json` at the root of this repo — not in an
 * environment variable. The admin panel has an identical file. Fields:
 *
 *   repo    "owner/name" of the database repo on GitHub.
 *   branch  its branch (default "main").
 *   url     where the database is published — the address of its Cloudflare Pages site.
 *           Optional: when empty, the files are read straight from GitHub (raw.githubusercontent.com,
 *           public repos only, refreshed by GitHub every few minutes).
 *
 * NOTE: `process.env.NEXT_PUBLIC_*` must be written out literally so Next.js can inline it
 * into the browser bundle.
 */
import databaseConfig from '../../database.json';

/** Public address of the website. Used for canonical / Open Graph metadata. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pcstat.org';

interface DatabaseLocation {
  repo: string;
  branch?: string;
  url?: string;
}

function databaseBaseUrl(location: DatabaseLocation): string {
  const url = location.url?.trim();
  if (url) return url.endsWith('/') ? url : `${url}/`;
  if (!/^[\w.-]+\/[\w.-]+$/.test(location.repo ?? '')) {
    throw new Error('database.json needs either "url" (the published database site) or "repo" as "owner/name".');
  }
  return `https://raw.githubusercontent.com/${location.repo}/${location.branch?.trim() || 'main'}/`;
}

/** Directory the database is published at, always ending with "/". */
export const DATABASE_BASE_URL = databaseBaseUrl(databaseConfig);

/**
 * Absolute URL of the database's own `database.json` index (published by the database repo).
 * Everything the website shows comes from the files this index points to.
 */
export const DATABASE_INDEX_URL = `${DATABASE_BASE_URL}database.json`;
