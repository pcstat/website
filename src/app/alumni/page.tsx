import React from 'react';
import { getExecutives } from '@/lib/database/server';
import { alumniView } from '@/lib/views';
import AlumniPage from './AlumniPage';

export default async function AlumniRoute() {
  return <AlumniPage initial={alumniView(await getExecutives())} />;
}
