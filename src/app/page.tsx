import React from 'react';
import { getExecutives, getProjects } from '@/lib/database/server';
import { homeStats } from '@/lib/views';
import HomePage from './HomePage';

export default async function HomeRoute() {
  // Computed on the server so the browser renders exactly the same numbers as the static HTML.
  const totalYears = new Date().getFullYear() - 2022;
  return <HomePage initial={homeStats(await getExecutives(), await getProjects(), totalYears)} />;
}
