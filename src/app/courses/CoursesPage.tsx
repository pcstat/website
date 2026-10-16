'use client';

import React from 'react';
import Link from 'next/link';
import { usePreview } from '@/lib/preview';
import { coursesView } from '@/lib/views';

export default function CoursesPage({ initial }: { initial: ReturnType<typeof coursesView> }) {
  const preview = usePreview();
  const { courses } = preview?.courses ? coursesView(preview.courses) : initial;

  return (
    <section className="pg active" id="page-courses" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Learning</div>
        <h2 className="pt">Courses & <span>Certificates</span></h2>
        <p className="pd">Professional certifications and specialized courses completed by our members.</p>
      </div>

      <div className="cgrid rv vis" id="courses-grid">
        {courses.map((c) => {
          const typeLabel = c.type === 'certificate' ? 'CERTIFICATE' : 'COURSE';
          const typeCls = c.type === 'certificate' ? 't-cert' : 't-course';

          return (
            <div key={c.id} className={`c-card ${c.featured ? 'featured' : ''}`}>
              <div className={`c-status ${typeCls}`}>{typeLabel}</div>
              <div className="c-title">{c.title}</div>
              <div className="c-provider">{c.provider}</div>
              <div className="c-desc">{c.description}</div>
              <div className="c-footer">
                <span className="c-year">📅 {c.year}</span>
                {c.link && (
                  <a className="c-link" href={c.link} target="_blank" rel="noopener noreferrer">
                    ↗ View
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="jcta rv vis" style={{ marginTop: '2rem' }}>
        <div>
          <h3>Verify <span>Certificate</span></h3>
          <p>Want to validate a certificate issued by the Statistics Programming Club? Enter the certificate ID to verify its authenticity.</p>
        </div>
        <Link className="bjoin" href="/certificate">
          Verify Now →
        </Link>
      </div>
    </section>
  );
}
