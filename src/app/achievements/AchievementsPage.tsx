'use client';

import React from 'react';
import AchievementGrid from './AchievementGrid';
import { usePreview } from '@/lib/preview';
import { achievementsView } from '@/lib/views';

export default function AchievementsPage({ initial }: { initial: ReturnType<typeof achievementsView> }) {
  const preview = usePreview();
  const { tally, achievements, names } = preview?.achievements && preview.executives ? achievementsView(preview.achievements, preview.executives) : initial;

  return (
    <section className="pg active" id="page-achievements" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Honors</div>
        <h2 className="pt">Our <span>Achievements</span></h2>
        <p className="pd">Competition results, recognitions, and milestones since 2022.</p>
      </div>

      {/* Tally strip */}
      <div className="tally rv vis" id="ach-tally">
        {tally.map((t, idx) => (
          <div key={idx} className="tc2">
            <div className="tn2">{t.value}</div>
            <div className="tl2">// {t.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <AchievementGrid key={preview?.rev ?? 0} achievements={achievements} memberNamesMap={names} />
    </section>
  );
}
