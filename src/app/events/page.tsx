import React from 'react';
import { getEvents } from '@/lib/database/server';
import EventsList from './EventsList';

export default async function EventsPage() {
  const data = await getEvents();
  const events = data.events || [];
  const note = data.note || '';

  return (
    <section className="pg active" id="page-events" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Schedule</div>
        <h2 className="pt">Upcoming <span>Events</span></h2>
        <p className="pd">Workshops, contests, and meetups. Open to all members — some open to the public.</p>
      </div>

      <EventsList events={events} />

      {note && (
        <p id="events-note" style={{ fontFamily: 'var(--fm)', fontSize: '.7rem', color: 'var(--mut)', marginTop: '2rem' }}>
          // {note}
        </p>
      )}
    </section>
  );
}
