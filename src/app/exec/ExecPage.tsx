'use client';

import React from 'react';
import ExecList from './ExecList';
import { usePreview } from '@/lib/preview';
import { execView } from '@/lib/views';

export default function ExecPage({ initial }: { initial: ReturnType<typeof execView> }) {
  const preview = usePreview();
  const { members, sessionLabel } = preview?.executives ? execView(preview.executives) : initial;

  return (
    <section className="pg active" id="page-exec" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Committee</div>
        <h2 className="pt">Current <span>Executives</span></h2>
        <p className="pd">The team leading Statistics Programming Club this year. Click any card to view their profile &amp; social links.</p>
        <div className="sbadge" id="exec-session-badge">
          <span className="bdot"></span>
          <span id="exec-session-text">Active Session · Committee {sessionLabel}</span>
        </div>
      </div>

      <ExecList key={preview?.rev ?? 0} members={members} sessionLabel={sessionLabel} />
    </section>
  );
}
