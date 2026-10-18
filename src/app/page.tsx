import React from 'react';
import { getAchievements, getEvents, getExecutives, getHome, getProjects } from '@/lib/database/server';
import { homeExtras, homeStats, terminalView } from '@/lib/views';
import HomePage from './HomePage';

export default async function HomeRoute() {
  // Computed on the server so the browser renders exactly the same numbers as the static HTML.
  const totalYears = new Date().getFullYear() - 2022;
  const [executives, projects, events, achievements, home] = await Promise.all([getExecutives(), getProjects(), getEvents(), getAchievements(), getHome()]);
  return (
    <HomePage
      initial={homeStats(executives, projects, totalYears)}
      initialTerminal={terminalView(executives, projects, events, achievements, home)}
      initialExtras={homeExtras(executives, projects, home)}
    />
  );
}
