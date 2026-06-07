import React from 'react';
import { getAchievements, Achievement } from '@/lib/data';
import { resolveMemberNames } from '@/lib/resolvers';
import AchievementGrid from './AchievementGrid';

export const revalidate = 3600;

export default async function AchievementsPage() {
  let tally: { value: string; label: string }[] = [];
  let achievements: Achievement[] = [];
  let memberNamesMap: Record<string, string> = {};

  try {
    const data = await getAchievements();
    tally = data.tally || [];
    achievements = data.achievements || [];

    // Resolve all member IDs to names on the server
    const allIds: string[] = [];
    achievements.forEach(a => {
      if (Array.isArray(a.members)) {
        allIds.push(...a.members);
      }
    });

    const uniqueIds = Array.from(new Set(allIds));
    const names = await resolveMemberNames(uniqueIds);

    uniqueIds.forEach((id, idx) => {
      if (names[idx]) memberNamesMap[id] = names[idx];
    });

    // Sort featured achievements first
    achievements.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
  } catch (err) {
    console.error('Error loading achievements:', err);
  }

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
