'use client';

import React from 'react';
import Link from 'next/link';
import Terminal from '@/components/Terminal';
import { usePreview } from '@/lib/preview';
import { useSite } from '@/lib/site';
import { MemberImage } from '@/app/profile/MemberImage';
import { homeExtras, homeStats, terminalView } from '@/lib/views';

export default function HomePage({
  initial,
  initialTerminal,
  initialExtras,
}: {
  initial: ReturnType<typeof homeStats>;
  initialTerminal: ReturnType<typeof terminalView>;
  initialExtras: ReturnType<typeof homeExtras>;
}) {
  const preview = usePreview();
  const site = useSite();
  const { club, home } = site;
  // The server computes the years from `club.founded`; a drafted founding year is recomputed here.
  const years = preview?.site ? new Date().getFullYear() - club.founded : initial.totalYears;
  const { totalMembers, membersLabel, totalProjects, totalPublications, totalYears } =
    preview?.executives && preview.projects ? homeStats(preview.executives, preview.projects, years) : { ...initial, totalYears: years };

  const terminal =
    preview?.executives && preview.projects && preview.events && preview.achievements && preview.home
      ? terminalView(preview.executives, preview.projects, preview.events, preview.achievements, preview.home)
      : initialTerminal;

  const extras =
    preview?.executives && preview.projects && preview.home ? homeExtras(preview.executives, preview.projects, preview.home) : initialExtras;

  return (
    <section className="pg active" id="page-home" style={{ display: 'block' }}>
      <div className="hero">
        <div className="hero-left">
          <div className="htag">Est. {club.founded} &nbsp;·&nbsp; {home.tag}</div>
          <h1 className="htitle">
            {home.title_lines.map((line, i) => (
              <React.Fragment key={i}>
                {i === 0 ? line : <span className={i === 1 ? 'ac' : 'dm'}>{line}</span>}
                {i < home.title_lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p className="hdesc">{home.description}</p>

          <div className="focus-pills">
            {home.pills.map((pill, i) => (
              <span key={i} className={`pill pill-${pill.style}`}>{pill.label}</span>
            ))}
          </div>
        </div>

        <div className="hero-right">
          <Terminal
            data={{ members: totalMembers, membersLabel, projects: totalProjects, publications: totalPublications, years: totalYears, ...terminal }}
          />
        </div>

        <div className="stats">
          <div>
            <div className="snum" id="stat-projects">{totalProjects}</div>
            <div className="slbl">// PROJECTS</div>
          </div>
          <div className="sdiv"></div>
          <div>
            <div className="snum" id="stat-pubs">{totalPublications}</div>
            <div className="slbl">// PUBLICATIONS</div>
          </div>
          <div className="sdiv"></div>
          <div>
            <div className="snum" id="stat-members">{totalMembers}</div>
            <div className="slbl">// {membersLabel}</div>
          </div>
          <div className="sdiv"></div>
          <div>
            <div className="snum" id="stat-years">{totalYears}</div>
            <div className="slbl">// YEARS</div>
          </div>
        </div>
      </div>

      <div className="hs">
        {extras.projects.length > 0 && (
          <div className="hs-block">
            <div className="hs-head">
              <div>
                <div className="pe">// {home.projects_block.eyebrow}</div>
                <h2 className="hs-title">{home.projects_block.title} <span>{home.projects_block.accent}</span></h2>
              </div>
              <Link href="/projects" className="hs-more">{home.projects_block.link_label}</Link>
            </div>
            <div className="hs-grid">
              {extras.projects.map((p) => (
                <Link key={p.id} href="/projects" className="hs-card">
                  <div className="hs-card-top">
                    <span className="hs-status" data-status={p.status}>{p.status}</span>
                    <span className="hs-year">{p.year}</span>
                  </div>
                  <h3 className="hs-card-title">{p.title}</h3>
                  <p className="hs-card-desc">{p.description}</p>
                  {p.tags.length > 0 && (
                    <div className="hs-tags">
                      {p.tags.map((t) => <span key={t}>{t}</span>)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {extras.members.length > 0 && (
          <div className="hs-block">
            <div className="hs-head">
              <div>
                <div className="pe">// {home.team_block.eyebrow}{extras.sessionLabel ? ` · ${extras.sessionLabel}` : ''}</div>
                <h2 className="hs-title">{home.team_block.title} <span>{home.team_block.accent}</span></h2>
              </div>
              <Link href="/exec" className="hs-more">{home.team_block.link_label}</Link>
            </div>
            <div className="hs-team">
              {extras.members.map((m) => (
                <Link key={m.id} href={`/profile?id=${m.id}`} className="hs-member">
                  <MemberImage src={m.icon} alt={m.name} fallback={m.initial} className="hs-av" />
                  <span className="hs-mtext">
                    <span className="hs-mname">{m.name}</span>
                    <span className="hs-mrole">{m.role}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="hs-cta">
          <div className="hs-cta-copy">
            <div className="pe">// {home.join.eyebrow}</div>
            <h2 className="hs-title">{home.join.title} <span>{home.join.accent}</span></h2>
            <p>{home.join.text}</p>
          </div>
          <Link href="/about" className="bjoin">{home.join.button_label}</Link>
        </div>
      </div>
    </section>
  );
}
