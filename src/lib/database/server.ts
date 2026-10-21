/**
 * Build-time database loaders, used by the server components (list pages).
 *
 * The site is a static export, so these run once per page while `next build` runs. Nothing is
 * swallowed: if the database cannot be reached the build FAILS, and the previous deployment keeps
 * serving — better than silently publishing a site with empty pages.
 */
import { DATABASE_INDEX_URL } from '../config';
import type {
  AchievementsSchema,
  Course,
  DatabaseSchema,
  EventsSchema,
  HomeConfig,
  Project,
  SiteConfig,
} from '../types';
import {
  assertAbsoluteIndexUrl,
  buildContext,
  memberNameMap,
  resolveExecutives,
  type DatabaseContext,
} from './shared';

const RETRIES = 3;
const CACHE_TTL_MS = 10_000; // only matters in `next dev`, where the same page renders again and again

const cache = new Map<string, { at: number; value: Promise<unknown> }>();

async function fetchJsonOnce<T>(url: string): Promise<T> {
  // A static export may only use cacheable fetches (`no-store` makes Next treat the page as dynamic
  // and fail the export). The unique `t` parameter makes every request a cache miss, so neither
  // Next's data cache (which survives between builds) nor a CDN can hand back an older copy.
  const fresh = new URL(url);
  fresh.searchParams.set('t', String(Date.now()));
  const res = await fetch(fresh, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as Promise<T>;

  const value = (async () => {
    let lastError: unknown;
    for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
      try {
        return await fetchJsonOnce<T>(url);
      } catch (error) {
        lastError = error;
        if (attempt < RETRIES) await new Promise((r) => setTimeout(r, 500 * attempt * attempt));
      }
    }
    const reason = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Could not load database file ${url}: ${reason}. Check "url" / "repo" in database.json; if the address is an old one, delete the .next folder (it caches fetches).`);
  })();

  cache.set(url, { at: Date.now(), value });
  // A failed load must not stay cached.
  value.catch(() => cache.delete(url));
  return value;
}

export async function getDatabaseContext(): Promise<DatabaseContext> {
  assertAbsoluteIndexUrl(DATABASE_INDEX_URL);
  const index = await fetchJson<DatabaseContext['index']>(DATABASE_INDEX_URL);
  return buildContext(DATABASE_INDEX_URL, index);
}

export async function getExecutives(): Promise<DatabaseSchema> {
  const ctx = await getDatabaseContext();
  return resolveExecutives(await fetchJson<DatabaseSchema>(ctx.index.executives), ctx);
}

export async function getProjects(): Promise<{ projects: Project[] }> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.projects);
}

export async function getAchievements(): Promise<AchievementsSchema> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.achievements);
}

export async function getEvents(): Promise<EventsSchema> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.events);
}

export async function getCourses(): Promise<{ courses: Course[] }> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.courses);
}

export async function getHome(): Promise<HomeConfig> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.home);
}

export async function getSite(): Promise<SiteConfig> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.site);
}

/** Maps student IDs to member names. IDs that match no member are left out of the result. */
export async function resolveMemberNameMap(studentIds: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(studentIds));
  if (unique.length === 0) return {};
  return memberNameMap(await getExecutives(), unique);
}
