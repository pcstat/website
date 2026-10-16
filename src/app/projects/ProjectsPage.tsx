'use client';

import React from 'react';
import ProjectSection from './ProjectSection';
import { usePreview } from '@/lib/preview';
import { projectsView } from '@/lib/views';

export default function ProjectsPage({ initial }: { initial: ReturnType<typeof projectsView> }) {
  const preview = usePreview();
  const { projects, names } = preview?.projects && preview.executives ? projectsView(preview.projects, preview.executives) : initial;

  return (
    <section className="pg active" id="page-projects" style={{ display: 'block' }}>
      <ProjectSection key={preview?.rev ?? 0} initialProjects={projects} memberNamesMap={names} />
    </section>
  );
}
