import React from 'react';
import { getExecutives, getProjects } from '@/lib/database/server';
import { projectsView } from '@/lib/views';
import ProjectsPage from './ProjectsPage';

export default async function ProjectsRoute() {
  return <ProjectsPage initial={projectsView(await getProjects(), await getExecutives())} />;
}
