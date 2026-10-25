/**
 * Code shared by the build-time (server) and runtime (browser) database loaders.
 *
 * The database is a separate repo that publishes `database.json` (an index of absolute URLs)
 * plus JSON files and photos. Data files only contain *relative* paths:
 *   - `icon_link`                 → relative to `imageBase`   (e.g. "executives/elon-musk.webp")
 *                                   or an absolute link to a photo the member keeps in their own repository
 *   - `profile_link`, `cv_link`   → relative to the database root (e.g. "members/elon-musk/cv.json")
 * Absolute links ("https://…" or "/…") are used as they are.
 */
import type { DatabaseIndex, DatabaseSchema, Member } from '../types';

export const PAGE_KEYS = ['executives', 'projects', 'events', 'courses', 'achievements', 'home', 'site'] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export interface DatabaseContext {
  index: DatabaseIndex;
  /** Directory that contains database.json, always ending with "/". */
  root: string;
  /** Where relative photo paths are resolved from, always ending with "/". */
  imageBase: string;
  /**
   * What gets written into pages for photos / links (differs from `root` / `imageBase` only when the database is read
   * from a private GitHub repo by the build: then it is the site's own proxy path). Defaults to root / imageBase.
   */
  publicRoot?: string;
  publicImageBase?: string;
}

/** Joins a (possibly root-relative, e.g. "/api/github/…/") base and a relative path. */
export function joinBase(base: string, relative: string): string {
  if (!base.startsWith('/')) return new URL(relative, base).href;
  const url = new URL(relative, `http://base.invalid${base}`);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function isAbsoluteLink(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('/') || value.startsWith('data:');
}

export function resolveLink(value: string | undefined, base: string): string | undefined {
  if (!value) return value;
  return isAbsoluteLink(value) ? value : new URL(value, base).href;
}

export function buildContext(indexUrl: string, index: DatabaseIndex, publicRoot?: string): DatabaseContext {
  for (const key of PAGE_KEYS) {
    if (!index[key]) throw new Error(`database.json (${indexUrl}) has no "${key}" entry.`);
  }
  if (!index.imageBase) throw new Error(`database.json (${indexUrl}) has no "imageBase" entry.`);
  const root = new URL('./', indexUrl).href;
  const imageBase = new URL(index.imageBase.endsWith('/') ? index.imageBase : `${index.imageBase}/`, root).href;
  // The database index holds paths relative to its own address (absolute URLs are also accepted);
  // from here on every entry is an absolute URL.
  const resolved = { ...index, imageBase } as DatabaseIndex;
  for (const key of PAGE_KEYS) resolved[key] = resolveLink(index[key], root) as string;
  if (!publicRoot) return { index: resolved, root, imageBase };
  const imageRelative = index.imageBase.endsWith('/') ? index.imageBase : `${index.imageBase}/`;
  const publicImageBase = isAbsoluteLink(index.imageBase) ? imageBase : joinBase(publicRoot, imageRelative);
  return { index: resolved, root, imageBase, publicRoot, publicImageBase };
}

export function assertAbsoluteIndexUrl(indexUrl: string): void {
  if (!/^https?:\/\//i.test(indexUrl)) {
    throw new Error(
      `The database address must be an absolute http(s) URL, got "${indexUrl}". ` +
        'Check "url" in database.json at the root of this repo.'
    );
  }
}

/** Turns the relative icon / profile / CV paths of a member into absolute URLs. */
export function resolveMember(member: Member, ctx: DatabaseContext): Member {
  const root = ctx.publicRoot ?? ctx.root;
  const imageBase = ctx.publicImageBase ?? ctx.imageBase;
  const resolve = (value: string | undefined, base: string) =>
    !value || isAbsoluteLink(value) ? value : joinBase(base, value);
  return {
    ...member,
    icon_link: resolve(member.icon_link, imageBase),
    profile_link: resolve(member.profile_link, root),
    cv_link: resolve(member.cv_link, root),
  };
}

export function resolveExecutives(data: DatabaseSchema, ctx: DatabaseContext): DatabaseSchema {
  return {
    ...data,
    committees: data.committees.map((committee) => ({
      ...committee,
      members: committee.members.map((member) => resolveMember(member, ctx)),
    })),
  };
}

/** Maps student IDs to member names (IDs that are not found are left out). */
export function memberNameMap(db: DatabaseSchema, studentIds: string[]): Record<string, string> {
  const members = db.committees.flatMap((committee) => committee.members);
  const names: Record<string, string> = {};
  for (const id of new Set(studentIds)) {
    const name = members.find((m) => m.student_id === id)?.name;
    if (name) names[id] = name;
  }
  return names;
}
