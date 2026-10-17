import React from 'react';
import { getEvents, getExecutives, getProjects } from '@/lib/database/server';
import { homeExtras, homeStats, terminalView } from '@/lib/views';
import HomePage from './HomePage';

export default async function HomeRoute() {
  // Computed on the server so the browser renders exactly the same numbers as the static HTML.
  const totalYears = new Date().getFullYear() - 2022;
  const [executives, projects, events] = await Promise.all([getExecutives(), getProjects(), getEvents()]);
  return <HomePage initial={homeStats(executives, projects, totalYears)} initialTerminal={terminalView(projects, events)} initialExtras={homeExtras(executives, projects)} />;
}
