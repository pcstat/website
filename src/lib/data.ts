import fs from 'fs/promises';
import path from 'path';
import {
  Member,
  RegistrySchema,
  DatabaseSchema,
  AchievementsSchema,
  Project,
  Course,
  EventsSchema,
  CertificatesSchema
} from './types';

export const MEDAL_ICON: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  special: '🏆',
  community: '🎖️',
};

/**
 * Formats the executive's role based on their committee membership.
 * Adds "Former" if the member is not part of the current committee.
 */
export function formatExecutiveRole(member: Member, isCurrentCommittee: boolean): string {
  if (!member.role) return '';
  const prefix = isCurrentCommittee ? '' : 'Former ';
  const roleStr = member.role.toLowerCase().startsWith('club ') ? member.role : `Club ${member.role}`;
  return `${prefix}${roleStr}`;
}

// Utility to load JSON data from either a local file or an external URL
export async function loadJsonData<T>(source: string): Promise<T> {
  if (source.startsWith('http')) {
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json() as T;
    } catch (err) {
      console.error(`Error fetching external data from ${source}:`, err);
      throw new Error(`Failed to load remote data from ${source}`);
    }
  }

  const relativePath = source.startsWith('/') ? source.slice(1) : source;
  const filePath = path.join(process.cwd(), 'public', relativePath);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading data file at ${filePath}:`, err);
    throw new Error(`Failed to load data from ${filePath}`);
  }
}

export const FALLBACK_REGISTRY: Record<string, string> = {
  executives: 'resources/data/executives.json',
  projects: 'resources/data/projects.json',
  events: 'resources/data/events.json',
  courses: 'resources/data/courses.json',
  achievements: 'resources/data/achievements.json',
  cv: 'resources/data/cv.json',
  certificates: 'resources/certificates/data/certificates.json'
};

export async function getRegistry(): Promise<RegistrySchema> {
  try {
    return await loadJsonData<RegistrySchema>('resources/data/database.json');
  } catch (err) {
    console.error('Failed to load database.json registry, using fallback registry:', err);
    return FALLBACK_REGISTRY;
  }
}

async function loadFromRegistryWithFallback<T>(key: string): Promise<T> {
  const fallbackPath = FALLBACK_REGISTRY[key];
  if (!fallbackPath) {
    throw new Error(`No fallback path defined for registry key: ${key}`);
  }

  let registry: RegistrySchema;
  try {
    registry = await getRegistry();
  } catch (err) {
    console.error(`Failed to load registry for key "${key}", trying fallback path: ${fallbackPath}`, err);
    return loadJsonData<T>(fallbackPath);
  }

  const path = registry[key];
  if (!path) {
    console.warn(`Registry key "${key}" not found in database.json, trying fallback path: ${fallbackPath}`);
    return loadJsonData<T>(fallbackPath);
  }

  try {
    return await loadJsonData<T>(path);
  } catch (err) {
    if (path !== fallbackPath) {
      console.error(`Failed to load resource from registry path "${path}". Trying fallback path: ${fallbackPath}`, err);
      return loadJsonData<T>(fallbackPath);
    }
    console.error(`Failed to load resource from fallback path: ${fallbackPath}`, err);
    throw err;
  }
}

export async function getDatabase(): Promise<DatabaseSchema> {
  return loadFromRegistryWithFallback<DatabaseSchema>('executives');
}

export async function getAchievements(): Promise<AchievementsSchema> {
  return loadFromRegistryWithFallback<AchievementsSchema>('achievements');
}

export async function getProjects(): Promise<{ projects: Project[] }> {
  return loadFromRegistryWithFallback<{ projects: Project[] }>('projects');
}

export async function getCourses(): Promise<{ courses: Course[] }> {
  return loadFromRegistryWithFallback<{ courses: Course[] }>('courses');
}

export async function getEvents(): Promise<EventsSchema> {
  return loadFromRegistryWithFallback<EventsSchema>('events');
}

export async function getCertificates(): Promise<CertificatesSchema> {
  return loadFromRegistryWithFallback<CertificatesSchema>('certificates');
}

