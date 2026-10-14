import React from 'react';
import { getAchievements, resolveMemberNameMap } from '@/lib/database/server';
import AchievementGrid from './AchievementGrid';

export default async function AchievementsPage() {
  const data = await getAchievements();
  const tally = data.tally || [];
  const achievements = data.achievements || [];

  // Resolve all member IDs to names on the server
  const allIds: string[] = [];
  achievements.forEach(a => {
    if (Array.isArray(a.members)) {
      allIds.push(...a.members);
    }
  });
  const memberNamesMap = await resolveMemberNameMap(allIds);

  // Sort featured achievements first
  achievements.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));

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

      <AchievementGrid
        achievements={achievements}
        memberNamesMap={memberNamesMap}
      />
    </section>
  );
}
