'use client';

import React from 'react';
import AlumniList from './AlumniList';
import { usePreview } from '@/lib/preview';
import { alumniView } from '@/lib/views';

export default function AlumniPage({ initial }: { initial: ReturnType<typeof alumniView> }) {
  const preview = usePreview();
  const { committees } = preview?.executives ? alumniView(preview.executives) : initial;

  return (
    <section className="pg active" id="page-alumni" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Alumni</div>
        <h2 className="pt">Past <span>Executives</span></h2>
        <p className="pd">The people who built what this club is today. Click any card to see their profile and social links.</p>
      </div>

      <AlumniList key={preview?.rev ?? 0} committees={committees} />
    </section>
  );
}
