import React from 'react';
import { getAchievements, getExecutives } from '@/lib/database/server';
import { achievementsView } from '@/lib/views';
import AchievementsPage from './AchievementsPage';

export default async function AchievementsRoute() {
  return <AchievementsPage initial={achievementsView(await getAchievements(), await getExecutives())} />;
}
