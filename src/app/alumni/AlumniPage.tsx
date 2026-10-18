'use client';

import React from 'react';
import AlumniList from './AlumniList';
import { usePreview } from '@/lib/preview';
import { useSite } from '@/lib/site';
import { alumniView } from '@/lib/views';

export default function AlumniPage({ initial }: { initial: ReturnType<typeof alumniView> }) {
  const preview = usePreview();
  const page = useSite().pages.alumni;
  const { committees } = preview?.executives ? alumniView(preview.executives) : initial;

  return (
    <section className="pg active" id="page-alumni" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// {page.eyebrow}</div>
        <h2 className="pt">{page.title} <span>{page.accent}</span></h2>
        <p className="pd">{page.description}</p>
      </div>

      <AlumniList key={preview?.rev ?? 0} committees={committees} />
    </section>
  );
}
