/**
 * Code shared by the build-time (server) and runtime (browser) database loaders.
 *
 * The database is a separate repo that publishes `database.json` (an index of absolute URLs)
 * plus JSON files and photos. Data files only contain *relative* paths:
 *   - `icon_link`                 → relative to `imageBase`   (e.g. "executives/elon-musk.webp")
 *   - `profile_link`, `cv_link`   → relative to the database root (e.g. "members/elon-musk/cv.json")
 * Absolute links ("https://…" or "/…") are used as they are.
 */
import type { DatabaseIndex, DatabaseSchema, Member } from '../types';

export const PAGE_KEYS = ['executives', 'projects', 'events', 'courses', 'achievements', 'certificates'] as const;
export type PageKey = (typeof PAGE_KEYS)[number];

export interface DatabaseContext {
  index: DatabaseIndex;
  /** Directory that contains database.json, always ending with "/". */
  root: string;
  /** Where relative photo paths are resolved from, always ending with "/". */
  imageBase: string;
}

export function isAbsoluteLink(value: string): boolean {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('/') || value.startsWith('data:');
}

export function resolveLink(value: string | undefined, base: string): string | undefined {
  if (!value) return value;
  return isAbsoluteLink(value) ? value : new URL(value, base).href;
}

export function buildContext(indexUrl: string, index: DatabaseIndex): DatabaseContext {
  for (const key of PAGE_KEYS) {
    if (!index[key]) throw new Error(`database.json (${indexUrl}) has no "${key}" entry.`);
  }
  if (!index.imageBase) throw new Error(`database.json (${indexUrl}) has no "imageBase" entry.`);
  const root = new URL('./', indexUrl).href;
  const imageBase = new URL(index.imageBase.endsWith('/') ? index.imageBase : `${index.imageBase}/`, root).href;
  return { index, root, imageBase };
}

export function assertAbsoluteIndexUrl(indexUrl: string): void {
  if (!/^https?:\/\//i.test(indexUrl)) {
    throw new Error(
      `DATABASE_INDEX_URL must be an absolute http(s) URL, got "${indexUrl}". ` +
        'Set NEXT_PUBLIC_DATABASE_INDEX_URL (see .env.example).'
    );
  }
}

/** Turns the relative icon / profile / CV paths of a member into absolute URLs. */
export function resolveMember(member: Member, ctx: DatabaseContext): Member {
  return {
    ...member,
    icon_link: resolveLink(member.icon_link, ctx.imageBase),
    profile_link: resolveLink(member.profile_link, ctx.root),
    cv_link: resolveLink(member.cv_link, ctx.root),
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
