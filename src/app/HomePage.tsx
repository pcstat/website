'use client';

import React from 'react';
import Link from 'next/link';
import Terminal from '@/components/Terminal';
import { usePreview } from '@/lib/preview';
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
  const { totalMembers, membersLabel, totalProjects, totalPublications, totalYears } =
    preview?.executives && preview.projects ? homeStats(preview.executives, preview.projects, initial.totalYears) : initial;

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
          <div className="htag">Est. 2022 &nbsp;·&nbsp; Statistics Programming Club</div>
          <h1 className="htitle">
            We write code.<br />
            <span className="ac">We build things.</span><br />
            <span className="dm">We compete.</span>
          </h1>
          <p className="hdesc">
            A community of programmers, problem-solvers, and builders.
            From competitive programming to ML research and open-source —
            this is where ideas become code.
          </p>

          <div className="focus-pills">
            <span className="pill pill-py">🐍 Python</span>
            <span className="pill pill-rp"> 🆁 R Programming</span>
            <span className="pill pill-ml">🤖 AI / ML</span>
            <span className="pill pill-ml">🧠 Deep Learning</span>
            <span className="pill pill-st">📊 Statistics</span>
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
                <div className="pe">// Portfolio</div>
                <h2 className="hs-title">Top <span>projects</span></h2>
              </div>
              <Link href="/projects" className="hs-more">All projects →</Link>
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
                <div className="pe">// Committee{extras.sessionLabel ? ` · ${extras.sessionLabel}` : ''}</div>
                <h2 className="hs-title">Club <span>leadership</span></h2>
              </div>
              <Link href="/exec" className="hs-more">All executives →</Link>
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
            <div className="pe">// Join us</div>
            <h2 className="hs-title">Bring curiosity. <span>We bring the club.</span></h2>
            <p>Open to every Stat major and minor — you don’t need to arrive as an expert.</p>
          </div>
          <Link href="/about" className="bjoin">How to join</Link>
        </div>
      </div>
    </section>
  );
}
