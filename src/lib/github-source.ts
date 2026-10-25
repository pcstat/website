/**
 * Reading the data repositories (database, certificates) straight from GitHub.
 *
 * `database.json` says where each data repo is read from:
 *   - "url" filled in  → the repo's own deployment (a Cloudflare Pages site). Nothing here is used.
 *   - "url" empty      → the files are read from GitHub with a read-only token, so the repos can be PRIVATE.
 *
 * The token (secret `DATA_READ_TOKEN`) NEVER reaches a visitor's browser:
 *   - while the site is built (GitHub Actions, server side) it is sent to raw.githubusercontent.com;
 *   - in the browser, files are requested from this site's own proxy (`functions/api/github/[[path]].ts`, a Cloudflare
 *     Pages Function), which adds the token on the server. A token that was bundled into the page would be readable by
 *     everybody, so the browser never gets one.
 * `next dev` has no Pages Functions: there the browser reads GitHub directly (works for public repos; for private repos
 * run the built site with `npx wrangler pages dev out --binding DATA_READ_TOKEN=…`, see docs/DEPLOYMENT.md).
 */
export const RAW_HOST = 'https://raw.githubusercontent.com/';
export const PROXY_PREFIX = '/api/github/';

/** True in a production build (`next build`): the browser must go through the proxy. */
const VIA_PROXY = process.env.NODE_ENV === 'production';

export const rawBase = (repo: string, branch: string) => `${RAW_HOST}${repo}/${branch}/`;
export const proxyPath = (repo: string, branch: string) => `${PROXY_PREFIX}${repo}/${branch}/`;

/** Where this code reads a GitHub repo from: the raw address on the server, the proxy in a production browser. */
export function githubBase(repo: string, branch: string): string {
  if (typeof window !== 'undefined' && VIA_PROXY) return `${window.location.origin}${proxyPath(repo, branch)}`;
  return rawBase(repo, branch);
}

/**
 * The root-relative form of a repo's address that is written into the HTML at build time (photos of the members), or
 * undefined when the raw address can be used as it is (a dev server, or a repo that has a deployment link).
 */
export function publicProxyPath(repo: string, branch: string): string | undefined {
  return VIA_PROXY ? proxyPath(repo, branch) : undefined;
}

/** Server side only: the Authorization header for a raw.githubusercontent.com address (none for any other host). */
export function serverAuthHeaders(url: string): Record<string, string> | undefined {
  const token = process.env.DATA_READ_TOKEN?.trim();
  if (!token || typeof window !== 'undefined' || !url.startsWith(RAW_HOST)) return undefined;
  return { Authorization: `token ${token}` };
}
