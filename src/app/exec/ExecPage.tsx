'use client';

import React from 'react';
import ExecList from './ExecList';
import { usePreview } from '@/lib/preview';
import { useSite } from '@/lib/site';
import { execView } from '@/lib/views';

export default function ExecPage({ initial }: { initial: ReturnType<typeof execView> }) {
  const preview = usePreview();
  const page = useSite().pages.exec;
  const { members, sessionLabel } = preview?.executives ? execView(preview.executives) : initial;

  return (
    <section className="pg active" id="page-exec" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// {page.eyebrow}</div>
        <h2 className="pt">{page.title} <span>{page.accent}</span></h2>
        <p className="pd">{page.description}</p>
        <div className="sbadge" id="exec-session-badge">
          <span className="bdot"></span>
          <span id="exec-session-text">Active Session · Committee {sessionLabel}</span>
        </div>
      </div>

      <ExecList key={preview?.rev ?? 0} members={members} sessionLabel={sessionLabel} />
    </section>
  );
}
