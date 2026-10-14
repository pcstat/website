'use client';

import React from 'react';
import Link from 'next/link';
import type { Achievement } from '@/lib/types';

const MEDAL_ICON: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  special: '🏆',
  community: '🎖️',
};

export default function AchievementGrid({
  achievements,
  memberNamesMap
}: {
  achievements: Achievement[],
  memberNamesMap: Record<string, string>
}) {
  return (
    <div className="agrid rv vis" id="ach-grid">
      {achievements.map((a, idx) => {
        const tier = a.tier || 'special';
        const icon = MEDAL_ICON[tier] || '🏅';

        return (
          <div key={idx} className={`ach ${tier} ${a.featured ? 'featured' : ''}`}>
            <div className="ai">{icon}</div>
            <div className="ayr">{a.year} · {(a.category || '').toUpperCase()}</div>
            <div className="atl">{a.title}</div>
            <div className="aev">{a.event}</div>
            <div className="amm">
              <strong>{a.team_label || 'Team'}:</strong>{' '}
              {a.members.map((id, mIdx) => (
                <React.Fragment key={id}>
                  <Link
                    href={`/profile?id=${id}`}
                    style={{
                      color: 'var(--ac)',
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    {memberNamesMap[id] || id}
                  </Link>
                  {mIdx < a.members.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
