import React from 'react';
import { getProjects, resolveMemberNameMap } from '@/lib/database/server';
import ProjectSection from './ProjectSection';

export default async function ProjectsPage() {
  const data = await getProjects();
  const projects = data.projects || [];

  // Resolve all member IDs to names on the server
  const allIds: string[] = [];
  projects.forEach(p => {
    if (Array.isArray(p.members)) {
      allIds.push(...p.members);
    }
  });
  const memberNamesMap = await resolveMemberNameMap(allIds);

  return (
    <section className="pg active" id="page-projects" style={{ display: 'block' }}>
      <ProjectSection initialProjects={projects} memberNamesMap={memberNamesMap} />
    </section>
  );
}
