/**
 * Build-time / runtime configuration.
 *
 * Where the database lives is configured in `database.json` at the root of this repo — not in an
 * environment variable. The admin panel has an identical file. Fields:
 *
 *   repo    "owner/name" of the database repo on GitHub.
 *   branch  its branch (default "main").
 *   url     where the database is published — the address of its Cloudflare Pages site.
 *           Optional: when empty, the files are read from GitHub with the read-only token `DATA_READ_TOKEN`
 *           (so the repo may be private; see src/lib/github-source.ts for how the token stays secret).
 *   admin   address of the admin panel (https://<worker>.<account>.workers.dev). Lets the panel's live preview
 *           send unsaved drafts to this site; empty = the site ignores such messages.
 *   certificates  the certificate registry (its own repo): { repo, branch, url }. Like the database, its files are read
 *           from GitHub with `DATA_READ_TOKEN` when `url` is empty — nothing has to be deployed.
 *
 * NOTE: `process.env.NEXT_PUBLIC_*` must be written out literally so Next.js can inline it
 * into the browser bundle.
 */
import databaseConfig from '../../database.json';
import { githubBase, publicProxyPath } from './github-source';

/** Public address of the website. Used for canonical / Open Graph metadata. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pcstat.org';

interface DatabaseLocation {
  repo: string;
  branch?: string;
  url?: string;
  admin?: string;
  certificates?: { repo?: string; branch?: string; url?: string };
}

function databaseBaseUrl(location: DatabaseLocation): string {
  const url = location.url?.trim();
  if (url) return url.endsWith('/') ? url : `${url}/`;
  if (!/^[\w.-]+\/[\w.-]+$/.test(location.repo ?? '')) {
    throw new Error('database.json needs either "url" (the published database site) or "repo" as "owner/name".');
  }
  return githubBase(location.repo, location.branch?.trim() || 'main');
}

/**
 * Address the browser should use for the database's files that are written into the pages at build time (photos).
 * Only set when the database is read from GitHub by a production build (then it is the site's own proxy path).
 */
export const DATABASE_PUBLIC_ROOT: string | undefined = (() => {
  const location = databaseConfig as DatabaseLocation;
  if (location.url?.trim() || !/^[\w.-]+\/[\w.-]+$/.test(location.repo ?? '')) return undefined;
  return publicProxyPath(location.repo, location.branch?.trim() || 'main');
})();

/** Directory the database is published at, always ending with "/". */
export const DATABASE_BASE_URL = databaseBaseUrl(databaseConfig);

/**
 * Absolute URL of the database's own `database.json` index (published by the database repo).
 * Everything the website shows comes from the files this index points to.
 */
export const DATABASE_INDEX_URL = `${DATABASE_BASE_URL}database.json`;

/**
 * Address of the admin panel that may preview drafts in this site (see src/lib/preview.ts).
 * `admin` in database.json; the NEXT_PUBLIC_ADMIN_ORIGIN environment variable, when set, takes precedence.
 */
export const ADMIN_ORIGIN: string = (process.env.NEXT_PUBLIC_ADMIN_ORIGIN || (databaseConfig as DatabaseLocation).admin || '').trim();

/**
 * Directory the certificate registry is read from, always ending with "/": `certificates.url` when set, otherwise
 * the repository on GitHub (through the site's proxy in the browser, see github-source.ts). Empty only when no registry is configured at
 * all. Certificates are read only in the browser (the verification page and the certificate viewer), so a missing
 * registry switches those two pages off instead of failing the build.
 */
export const CERTIFICATES_BASE_URL: string = (() => {
  const c = (databaseConfig as DatabaseLocation).certificates;
  const url = c?.url?.trim();
  if (url) return url.endsWith('/') ? url : `${url}/`;
  const repo = c?.repo?.trim();
  if (!repo) return '';
  return githubBase(repo, c?.branch?.trim() || 'main');
})();
