/**
 * Runtime database loaders, used in the browser by the pages that depend on a `?id=` query
 * (profile, CV, certificate verification). They always read the live database, so edits made
 * in the admin panel show up there without waiting for a website rebuild.
 *
 * Requires the database site to send CORS headers (`_headers` in the database repo).
 */
import { DATABASE_INDEX_URL } from '../config';
import type {
  AchievementsSchema,
  CertificatesSchema,
  DatabaseSchema,
  ProfileData,
  Project,
} from '../types';
import {
  assertAbsoluteIndexUrl,
  buildContext,
  resolveExecutives,
  resolveLink,
  type DatabaseContext,
} from './shared';

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${url}`);
  return (await res.json()) as T;
}

let contextPromise: Promise<DatabaseContext> | null = null;

export function getDatabaseContext(): Promise<DatabaseContext> {
  if (!contextPromise) {
    assertAbsoluteIndexUrl(DATABASE_INDEX_URL);
    contextPromise = fetchJson<DatabaseContext['index']>(DATABASE_INDEX_URL)
      .then((index) => buildContext(DATABASE_INDEX_URL, index))
      .catch((error) => {
        contextPromise = null; // allow a retry on the next call
        throw error;
      });
  }
  return contextPromise;
}

export async function clientGetExecutives(): Promise<DatabaseSchema> {
  const ctx = await getDatabaseContext();
  return resolveExecutives(await fetchJson<DatabaseSchema>(ctx.index.executives), ctx);
}

export async function clientGetProjects(): Promise<{ projects: Project[] }> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.projects);
}

export async function clientGetAchievements(): Promise<AchievementsSchema> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.achievements);
}

export async function clientGetCertificates(): Promise<CertificatesSchema> {
  const ctx = await getDatabaseContext();
  return fetchJson(ctx.index.certificates);
}

/** Loads a member's CV JSON. `cvLink` is the already-resolved absolute URL from `clientGetExecutives`. */
export function clientLoadCV<T>(cvLink: string): Promise<T> {
  return fetchJson<T>(cvLink);
}

/** Loads a member's dynamic-profile JSON. `profileLink` is the already-resolved absolute URL. */
export async function clientLoadProfile(profileLink: string): Promise<ProfileData> {
  const [data, ctx] = await Promise.all([fetchJson<ProfileData>(profileLink), getDatabaseContext()]);
  // A photo path inside the profile JSON is relative to the photo base, like `icon_link`.
  return data.photo ? { ...data, photo: resolveLink(data.photo, ctx.imageBase) } : data;
}
