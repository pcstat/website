import React from 'react';
import { getAchievements, getEvents, getExecutives, getHome, getProjects, getSite } from '@/lib/database/server';
import { homeExtras, homeStats, terminalView } from '@/lib/views';
import HomePage from './HomePage';

export default async function HomeRoute() {
  // Computed on the server so the browser renders exactly the same numbers as the static HTML.
  const [executives, projects, events, achievements, home, site] = await Promise.all([getExecutives(), getProjects(), getEvents(), getAchievements(), getHome(), getSite()]);
  const totalYears = new Date().getFullYear() - site.club.founded;
  return (
    <HomePage
      initial={homeStats(executives, projects, totalYears)}
      initialTerminal={terminalView(executives, projects, events, achievements, home)}
      initialExtras={homeExtras(executives, projects, home)}
    />
  );
}
