'use client';

import React from 'react';
import { useSite } from '@/lib/site';

export default function AboutPage() {
  const { about, club } = useSite();
  const { contact } = about;

  return (
    <section className="pg active" id="page-about" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// {about.eyebrow}</div>
        <h2 className="pt">{about.title} <span>{about.accent}</span></h2>
        <p className="pd">{about.description}</p>
      </div>

      <div className="abg rv vis">
        {about.cards.map((card, i) => (
          <div key={i} className={`abc${card.wide ? ' wide' : ''}`}>
            <h3><span className="tag">{String(i + 1).padStart(2, '0')}</span> {card.title}</h3>
            <p>{card.text}</p>
          </div>
        ))}
      </div>

      {about.meetups.length > 0 && (
        <div className="mtr rv vis">
          {about.meetups.map((m, i) => (
            <div key={i} className="mtc">
              <div className="mtd">// {m.label}</div>
              <div className="mtt">{m.title}</div>
              <div className="mtl">{m.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div className="jcta rv vis">
        <div>
          <h3>{contact.title} <span>{contact.accent}</span></h3>
          <p>{contact.text}</p>
        </div>
        <a className="bjoin" href={`mailto:${club.email}`}>{contact.button_label}</a>
      </div>
    </section>
  );
}
