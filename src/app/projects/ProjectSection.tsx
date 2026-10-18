'use client';

import React, { useState } from 'react';
import type { Project } from '@/lib/types';
import Link from 'next/link';
import { useSite } from '@/lib/site';

const STATUS_CLASS: Record<string, string> = {
  active: 'active',
  completed: 'completed',
  research: 'research',
  publication: 'research'
};

const STATUS_LABEL: Record<string, string> = {
  active: '● ACTIVE',
  completed: '◆ COMPLETED',
  research: '◈ RESEARCH',
  publication: '★ PUBLICATION'
};

export default function ProjectSection({
  initialProjects,
  memberNamesMap
}: {
  initialProjects: Project[],
  memberNamesMap: Record<string, string>
}) {
  const page = useSite().pages.projects;
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'publications'>('all');

  // Filter projects based on active tab
  const getFilteredProjects = () => {
    let filtered = [...initialProjects];
    if (activeTab === 'projects') {
      filtered = filtered.filter(p => p.status !== 'publication' && p.status !== 'research');
    } else if (activeTab === 'publications') {
      filtered = filtered.filter(p => p.status === 'publication' || p.status === 'research');
    }

    // Sort by featured status first, but always keep Club Website at the top
    return filtered.sort((a, b) => {
      if (a.title === 'Club Website') return -1;
      if (b.title === 'Club Website') return 1;
      return a.featured === b.featured ? 0 : a.featured ? -1 : 1;
    });
  };

  const filteredProjects = getFilteredProjects();

  return (
    <>
      <div className="ph rv vis">
        <div className="pe">// {page.eyebrow}</div>
        <h2 className="pt">{page.title} <span>{page.accent}</span></h2>
        <p className="pd">{page.description}</p>

        <div className="proj-toggle" id="proj-toggle">
          <button
            className={`pt-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`pt-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            className={`pt-btn ${activeTab === 'publications' ? 'active' : ''}`}
            onClick={() => setActiveTab('publications')}
          >
            Publications
          </button>
        </div>
      </div>

      <div className="proj-grid rv vis" id="proj-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((p) => {
            const statusCls = STATUS_CLASS[p.status] || 'active';
            const statusLbl = STATUS_LABEL[p.status] || '● ACTIVE';
            
            const demoText = p.status === 'research' || p.status === 'publication' ? '⬡ DOI ↗' : '⬡ Visit ↗';

            return (
              <div key={p.title} className={`proj-card ${p.featured ? 'featured' : ''}`}>
                <div className={`proj-status ${statusCls}`}>
                  <span className="proj-status-dot"></span>{statusLbl}
                </div>
                <div className="proj-title">{p.title}</div>
                <div className="proj-desc">{p.description}</div>
                <div className="proj-tags">
                  {(p.tags || []).map((t, idx) => (
                    <span key={idx} className="proj-tag">{t}</span>
                  ))}
                </div>
                <div className="proj-footer">
                  <span className="proj-members">
                    👥 {p.members.map((id, idx) => (
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
                        {idx < p.members.length - 1 ? ', ' : ''}
                      </React.Fragment>
                    ))}
                  </span>
                  {(p.link || p.demo_link) && (
                    <div className="proj-links">
                      {p.link && (
                        <a className="proj-link repo" href={p.link} target="_blank" rel="noopener noreferrer">
                          ⌥ Repo ↗
                        </a>
                      )}
                      {p.demo_link && (
                        <a className="proj-link demo" href={p.demo_link} target="_blank" rel="noopener noreferrer">
                          {demoText}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ fontFamily: 'var(--fm)', fontSize: '.78rem', color: 'var(--mut)', padding: '2rem 0' }}>
            // No items found in this category.
          </p>
        )}
      </div>
    </>
  );
}
