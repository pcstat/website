import React from 'react';
import { getExecutives } from '@/lib/database/server';
import { execView } from '@/lib/views';
import ExecPage from './ExecPage';

export default async function ExecutivesPage() {
  return <ExecPage initial={execView(await getExecutives())} />;
}
