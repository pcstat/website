'use client';

import React from 'react';
import EventsList from './EventsList';
import { usePreview } from '@/lib/preview';
import { useSite } from '@/lib/site';
import { eventsView } from '@/lib/views';

export default function EventsPage({ initial }: { initial: ReturnType<typeof eventsView> }) {
  const preview = usePreview();
  const page = useSite().pages.events;
  const { events, note } = preview?.events ? eventsView(preview.events) : initial;

  return (
    <section className="pg active" id="page-events" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// {page.eyebrow}</div>
        <h2 className="pt">{page.title} <span>{page.accent}</span></h2>
        <p className="pd">{page.description}</p>
      </div>

      <EventsList key={preview?.rev ?? 0} events={events} />

      {note && (
        <p id="events-note" style={{ fontFamily: 'var(--fm)', fontSize: '.7rem', color: 'var(--mut)', marginTop: '2rem' }}>
          // {note}
        </p>
      )}
    </section>
  );
}
