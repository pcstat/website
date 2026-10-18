/**
 * Page data derived from the database files. Pure functions: the server pages call them at build time,
 * and the same pages call them again in the browser when the admin panel's live preview sends a draft
 * (see src/lib/preview.ts), so a draft is shown exactly the way the published data would be.
 */
import { memberNameMap } from './database/shared';
import type { AchievementsSchema, Course, DatabaseSchema, EventsSchema, HomeConfig, Project } from './types';

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
  // A member count typed in by the admin is a count of members; otherwise the number is the executives we list.
  const hasMemberCount = typeof current?.total_members === 'number';
  const totalMembers = current ? (hasMemberCount ? (current.total_members as number) : current.members.length) : 0;
  const membersLabel: 'MEMBERS' | 'EXECUTIVES' = hasMemberCount ? 'MEMBERS' : 'EXECUTIVES';
  const all = [...(projData.projects || []), { status: 'active' }]; // includes the hardcoded club website
  const totalProjects = all.filter((p) => p.status !== 'publication' && p.status !== 'research').length;
  const totalPublications = all.filter((p) => p.status === 'publication' || p.status === 'research').length;
  return { totalMembers, membersLabel, totalProjects, totalPublications, totalYears };
}

/** The projects the admin pinned for the home page, in the pinned order (ids that match no project are skipped). */
function pinnedProjects(projData: { projects: Project[] }, home: HomeConfig) {
  const byId = new Map((projData.projects || []).map((p) => [p.id, p]));
  return (home.pinned_projects || []).flatMap((id) => {
    const project = byId.get(id);
    return project ? [project] : [];
  });
}

/** The facts the home page terminal prints: pinned team and projects, events, achievements tally, past committees. */
export function terminalView(
  db: DatabaseSchema,
  projData: { projects: Project[] },
  eventsDoc: EventsSchema,
  achievementsDoc: AchievementsSchema,
  home: HomeConfig,
) {
  const topProjects = pinnedProjects(projData, home).map((p) => ({ title: p.title, status: p.status }));
  const events = (eventsDoc.events || []).map((e) => ({ title: e.title, date: e.date, time: e.time, location: e.location }));
  const team = homeExtras(db, projData, home).members.map((m) => ({ name: m.name, role: m.role }));
  const tally = (achievementsDoc.tally || []).map((t) => ({ value: t.value, label: t.label }));
  const pastCommittees = db.committees.filter((c) => c.session !== db.current_committee).map((c) => c.label || c.session);
  return { topProjects, events, team, tally, pastCommittees };
}

/** What the home page shows under the hero: the pinned top projects and the pinned executives of the current committee. */
export function homeExtras(db: DatabaseSchema, projData: { projects: Project[] }, home: HomeConfig) {
  const current = db.committees.find((c) => c.session === db.current_committee);
  const byId = new Map((current?.members ?? []).map((m) => [m.student_id, m]));
  const members = (home.pinned_executives || []).flatMap((id) => {
    const m = byId.get(id);
    return m ? [{ id: m.student_id, name: m.name, role: m.role ?? '', icon: m.icon_link ?? '', initial: m.initial }] : [];
  });
  const projects = pinnedProjects(projData, home).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    status: p.status,
    year: p.year,
    tags: (p.tags || []).slice(0, 3),
  }));
  return { members, projects, sessionLabel: current?.label ?? '' };
}
