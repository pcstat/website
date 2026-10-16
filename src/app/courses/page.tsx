import React from 'react';
import { getCourses } from '@/lib/database/server';
import { coursesView } from '@/lib/views';
import CoursesPage from './CoursesPage';

export default async function CoursesRoute() {
  return <CoursesPage initial={coursesView(await getCourses())} />;
}
