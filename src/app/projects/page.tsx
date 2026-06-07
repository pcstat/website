import React from 'react';
import { getProjects, Project, getDatabase } from '@/lib/data';
import ProjectSection from './ProjectSection';
import { resolveMemberNames } from '@/lib/resolvers';

export const revalidate = 3600;


export default async function ProjectsPage() {
  let projects: Project[] = [];
  let memberNamesMap: Record<string, string> = {};

  try {
    const data = await getProjects();
    projects = data.projects || [];

    // Resolve all member IDs to names on the server
    const allIds: string[] = [];
    projects.forEach(p => {
      if (Array.isArray(p.members)) {
        allIds.push(...p.members);
      }
    });

    const uniqueIds = Array.from(new Set(allIds));
    const names = await resolveMemberNames(uniqueIds);

    uniqueIds.forEach((id, idx) => {
      if (names[idx]) memberNamesMap[id] = names[idx];
    });
  } catch (err) {
    console.error('Error loading projects:', err);
    projects = [];
  }

  return (
    <section className="pg active" id="page-projects" style={{ display: 'block' }}>
      <ProjectSection initialProjects={projects} memberNamesMap={memberNamesMap} />
    </section>
  );
}
