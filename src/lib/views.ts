/**
 * Page data derived from the database files. Pure functions: the server pages call them at build time,
 * and the same pages call them again in the browser when the admin panel's live preview sends a draft
 * (see src/lib/preview.ts), so a draft is shown exactly the way the published data would be.
 */
import { memberNameMap } from './database/shared';
import type { AchievementsSchema, Course, DatabaseSchema, EventsSchema, Project } from './types';

export function execView(db: DatabaseSchema) {
  const current = db.committees.find((c) => c.session === db.current_committee);
  return { members: current ? current.members : [], sessionLabel: current ? current.label : 'Active Session' };
}

export function alumniView(db: DatabaseSchema) {
  return { committees: db.committees.filter((c) => c.session !== db.current_committee) };
}

export function projectsView(doc: { projects: Project[] }, db: DatabaseSchema) {
  const projects = doc.projects || [];
  const ids = projects.flatMap((p) => (Array.isArray(p.members) ? p.members : []));
  return { projects, names: memberNameMap(db, ids) };
}

export function achievementsView(doc: AchievementsSchema, db: DatabaseSchema) {
  const achievements = [...(doc.achievements || [])];
  const ids = achievements.flatMap((a) => (Array.isArray(a.members) ? a.members : []));
  // Featured achievements first.
  achievements.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
  return { tally: doc.tally || [], achievements, names: memberNameMap(db, ids) };
}

export function coursesView(doc: { courses: Course[] }) {
  // Featured first, then by year descending.
  const courses = [...(doc.courses || [])].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.year.localeCompare(a.year);
  });
  return { courses };
}

export function eventsView(doc: EventsSchema) {
  return { events: doc.events || [], note: doc.note || '' };
}

export function homeStats(db: DatabaseSchema, projData: { projects: Project[] }, totalYears: number) {
  const current = db.committees.find((c) => c.session === db.current_committee);
  const totalMembers = current ? (current.total_members ?? current.members.length) : 0;
  const all = [...(projData.projects || []), { status: 'active' }]; // includes the hardcoded club website
  const totalProjects = all.filter((p) => p.status !== 'publication' && p.status !== 'research').length;
  const totalPublications = all.filter((p) => p.status === 'publication' || p.status === 'research').length;
  return { totalMembers, totalProjects, totalPublications, totalYears };
}
