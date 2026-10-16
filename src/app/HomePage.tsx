'use client';

import React from 'react';
import Terminal from '@/components/Terminal';
import { usePreview } from '@/lib/preview';
import { homeStats } from '@/lib/views';

export default function HomePage({ initial }: { initial: ReturnType<typeof homeStats> }) {
  const preview = usePreview();
  const { totalMembers, totalProjects, totalPublications, totalYears } =
    preview?.executives && preview.projects ? homeStats(preview.executives, preview.projects, initial.totalYears) : initial;

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
              <div className="slbl">// MEMBERS</div>
            </div>
            <div className="sdiv"></div>
            <div>
              <div className="snum" id="stat-years">{totalYears}</div>
              <div className="slbl">// YEARS</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <Terminal />
        </div>
      </div>
    </section>
  );
}
