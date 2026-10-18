/**
 * Live preview for the admin panel.
 *
 * The admin panel shows this site in an iframe and posts it the drafts (unsaved changes). While a draft is
 * present, the pages show it instead of the published data — nothing is saved anywhere.
 *
 * Off by default: it only runs inside an iframe, and only when "admin" in database.json (the admin panel's
 * address, e.g. https://pcstat-admin.example.workers.dev; or NEXT_PUBLIC_ADMIN_ORIGIN) is set at build time; messages from any other
 * origin are ignored.
 *
 *   this site → admin   { type: "club-preview:ready" }
 *   admin → this site   { type: "club-preview:data", payload }
 */
import { useSyncExternalStore } from 'react';
import { ADMIN_ORIGIN } from './config';
import { resolveExecutives, type DatabaseContext } from './database/shared';
import type { AchievementsSchema, CertificatesSchema, Course, DatabaseSchema, EventsSchema, HomeConfig, Project, SiteConfig } from './types';

const READY = 'club-preview:ready';
const DATA = 'club-preview:data';

function adminOrigin(): string | null {
  const raw = ADMIN_ORIGIN;
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

interface Payload {
  docs?: Record<string, unknown>;
  files?: Record<string, unknown>;
  root?: string;
  imageBase?: string;
}

export interface PreviewState {
  /** Increases with every update — use it as a React `key` to remount components that copy their props into state. */
  rev: number;
  root: string;
  files: Record<string, unknown>;
  executives?: DatabaseSchema;
  projects?: { projects: Project[] };
  events?: EventsSchema;
  courses?: { courses: Course[] };
  achievements?: AchievementsSchema;
  certificates?: CertificatesSchema;
  home?: HomeConfig;
  site?: SiteConfig;
}

let state: PreviewState | null = null;
const listeners = new Set<() => void>();

function publish(next: PreviewState) {
  state = next;
  listeners.forEach((l) => l());
}

function receive(payload: Payload) {
  const root = typeof payload.root === 'string' && payload.root ? payload.root : '';
  const imageBase = typeof payload.imageBase === 'string' ? payload.imageBase : root;
  const docs = payload.docs ?? {};
  const files: Record<string, unknown> = { ...(payload.files ?? {}), ...docs };
  const ctx = { root, imageBase } as DatabaseContext;
  const executives = docs['executives.json'] as DatabaseSchema | undefined;
  publish({
    rev: (state?.rev ?? 0) + 1,
    root,
    files,
    executives: executives ? resolveExecutives(executives, ctx) : undefined,
    projects: docs['projects.json'] as PreviewState['projects'],
    events: docs['events.json'] as PreviewState['events'],
    courses: docs['courses.json'] as PreviewState['courses'],
    achievements: docs['achievements.json'] as PreviewState['achievements'],
    certificates: docs['certificates.json'] as PreviewState['certificates'],
    home: docs['home.json'] as PreviewState['home'],
    site: docs['site.json'] as PreviewState['site'],
  });
}

/** Starts listening for drafts. Returns a cleanup function. Does nothing outside the admin panel's iframe. */
export function startPreviewBridge(): () => void {
  const origin = adminOrigin();
  if (!origin || typeof window === 'undefined' || window.parent === window) return () => {};
  const onMessage = (event: MessageEvent) => {
    if (event.origin !== origin || event.source !== window.parent) return;
    const data = event.data as { type?: string; payload?: Payload } | null;
    if (data?.type === DATA && data.payload) receive(data.payload);
  };
  window.addEventListener('message', onMessage);
  window.parent.postMessage({ type: READY }, origin);
  return () => window.removeEventListener('message', onMessage);
}

/** A drafted JSON file for `url` (a published address), or undefined when there is no draft for it. */
export function previewFile(url: string): unknown {
  if (!state) return undefined;
  if (state.root && url.startsWith(state.root)) {
    const draft = state.files[url.slice(state.root.length)];
    if (draft !== undefined) return draft;
  }
  return state.files[url];
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The current drafts, or null when this page is not being previewed. Always null on the server. */
export function usePreview(): PreviewState | null {
  return useSyncExternalStore(subscribe, () => state, () => null);
}
