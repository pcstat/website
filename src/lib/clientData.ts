import { DatabaseSchema, Project, AchievementsSchema, Member } from './types';

export const MEDAL_ICON: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  special: '🏆',
  community: '🎖️',
};

export function formatExecutiveRole(member: Member, isCurrentCommittee: boolean): string {
  if (!member.role) return '';
  const prefix = isCurrentCommittee ? '' : 'Former ';
  const roleStr = member.role.toLowerCase().startsWith('club ') ? member.role : `Club ${member.role}`;
  return `${prefix}${roleStr}`;
}

export async function fetchJsonData<T>(source: string): Promise<T> {
  const url = source.startsWith('http') ? source : (source.startsWith('/') ? source : `/${source}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json() as T;
}

export async function clientGetRegistry(): Promise<Record<string, string>> {
  try {
    return await fetchJsonData<Record<string, string>>('resources/data/database.json');
  } catch (err) {
    console.error('Failed to load database.json registry client-side, using fallback:', err);
    return {
      executives: 'resources/data/executives.json',
      projects: 'resources/data/projects.json',
      events: 'resources/data/events.json',
      courses: 'resources/data/courses.json',
      achievements: 'resources/data/achievements.json',
      cv: 'resources/data/cv.json',
      certificates: 'resources/certificates/data/certificates.json'
    };
  }
}

export async function clientGetDatabase(): Promise<DatabaseSchema> {
  const registry = await clientGetRegistry();
  const path = registry.executives || 'resources/data/executives.json';
  return await fetchJsonData<DatabaseSchema>(path);
}

export async function clientGetProjects(): Promise<{ projects: Project[] }> {
  const registry = await clientGetRegistry();
  const path = registry.projects || 'resources/data/projects.json';
  return await fetchJsonData<{ projects: Project[] }>(path);
}

export async function clientGetAchievements(): Promise<AchievementsSchema> {
  const registry = await clientGetRegistry();
  const path = registry.achievements || 'resources/data/achievements.json';
  return await fetchJsonData<AchievementsSchema>(path);
}

export async function clientLoadExecutiveCV<T>(cvLink: string): Promise<T> {
  if (cvLink.startsWith('http')) {
    try {
      return await fetchJsonData<T>(cvLink);
    } catch (err) {
      console.error(`Failed to load external CV from URL "${cvLink}". Falling back:`, err);
      return clientLoadFallbackCV<T>();
    }
  }

  try {
    const registry = await clientGetRegistry();
    const cleanKey = cvLink.replace(/^\//, '');

    // 1. Check if registry has the exact or clean key
    if (registry[cvLink]) {
      return await fetchJsonData<T>(registry[cvLink]);
    } else if (registry[cleanKey]) {
      return await fetchJsonData<T>(registry[cleanKey]);
    }

    // 2. Fallback: treat cvLink as a path relative to /resources/data/ or /resources/data/new/
    const fileName = cleanKey.endsWith('.json') ? cleanKey : `${cleanKey}.json`;

    try {
      return await fetchJsonData<T>(`resources/data/${fileName}`);
    } catch (e) {
      try {
        return await fetchJsonData<T>(`resources/data/new/${fileName}`);
      } catch (e2) {
        try {
          return await fetchJsonData<T>(fileName);
        } catch (e3) {
          console.error(`Failed to load CV relative path "${fileName}", trying registry/fallback CV:`, e3);
          return clientLoadFallbackCV<T>();
        }
      }
    }
  } catch (err) {
    console.error('Error resolving Executive CV path client-side:', err);
    return clientLoadFallbackCV<T>();
  }
}

export async function clientLoadProfile<T>(profileLink: string): Promise<T> {
  if (profileLink.startsWith('http')) {
    return await fetchJsonData<T>(profileLink);
  }

  const cleanKey = profileLink.replace(/^\//, '');

  try {
    const registry = await clientGetRegistry();
    if (registry[profileLink]) {
      return await fetchJsonData<T>(registry[profileLink]);
    } else if (registry[cleanKey]) {
      return await fetchJsonData<T>(registry[cleanKey]);
    }
  } catch (err) {
    console.warn('Error loading registry for profile loading, continuing with direct path:', err);
  }

  const fileName = cleanKey.endsWith('.json') ? cleanKey : `${cleanKey}.json`;

  try {
    return await fetchJsonData<T>(`resources/data/${fileName}`);
  } catch (e) {
    try {
      return await fetchJsonData<T>(fileName);
    } catch (e2) {
      throw new Error(`Failed to load profile path "${profileLink}": ${e2}`);
    }
  }
}

async function clientLoadFallbackCV<T>(): Promise<T> {
  try {
    const registry = await clientGetRegistry();
    const fallbackPath = registry.cv || 'resources/data/cv.json';
    return await fetchJsonData<T>(fallbackPath);
  } catch (err) {
    console.error('Failed to load fallback CV:', err);
    throw err;
  }
}
