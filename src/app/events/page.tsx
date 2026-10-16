import React from 'react';
import { getEvents } from '@/lib/database/server';
import { eventsView } from '@/lib/views';
import EventsPage from './EventsPage';

export default async function EventsRoute() {
  return <EventsPage initial={eventsView(await getEvents())} />;
}
