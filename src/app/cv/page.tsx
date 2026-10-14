'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './cv.module.css';
import { clientGetExecutives, clientLoadCV } from '@/lib/database/client';
import { formatExecutiveRole } from '@/lib/format';
import type { Member } from '@/lib/types';
import { useLayout } from '@/components/LayoutWrapper';
import { useTheme } from '@/context/ThemeContext';

// SVG Icons for Theme Toggle (scaled to matches website layout)
const SUN_ICON = (
  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.63" y2="5.63"></line>
    <line x1="18.37" y1="4.22" x2="19.78" y2="5.63"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.63" y2="18.37"></line>
    <line x1="18.37" y1="19.78" x2="19.78" y2="18.37"></line>
  </svg>
);

const MOON_ICON = (
  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

function RenderList({ bullets, format = 'bullets' }: { bullets?: any[]; format?: 'bullets' | 'commas' }) {
  if (!bullets || !Array.isArray(bullets)) return null;

  if (format === 'commas') {
    return (
      <div className={styles.cvCommaList}>
        {bullets.map((bullet: any, bIdx: number) => (
          <span key={bIdx} className={styles.cvCommaItem}>
            {typeof bullet === 'object' && bullet !== null ? bullet.text : bullet}
            {bIdx < bullets.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.cvBullets}>
      {bullets.map((bullet: any, bIdx: number) => {
        if (typeof bullet === 'object' && bullet !== null) {
          return (
            <div key={bIdx} className={styles.cvBulletGroup}>
              <div className={styles.cvBulletMain}>{bullet.text}</div>
              <div className={styles.cvBulletChildren}>
                {(bullet.children || []).map((child: string, cIdx: number) => (
                  <div key={cIdx} className={styles.cvBulletChild}>{child}</div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div key={bIdx} className={styles.cvBullet}>
            {bullet}
          </div>
        );
      })}
    </div>
  );
}

function CVEntry({ title, subtitle, dates, bullets, commas }: { title?: string; subtitle?: string; dates?: string; bullets?: any[]; commas?: any[] }) {
  return (
    <div className={styles.cvExpBlock}>
      <div className={styles.cvExpHeader}>
        <span className={styles.cvExpRole}>{title}</span>
        {dates && <span className={styles.cvExpDates}>{dates}</span>}
      </div>
      {subtitle && <div className={styles.cvExpCompany}>{subtitle}</div>}
      <RenderList bullets={bullets} format="bullets" />
      <RenderList bullets={commas} format="commas" />
    </div>
  );
}

function CVContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const { setIsFullscreen } = useLayout();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cvData, setCvData] = useState<{
    member: Member;
    committeeLabel: string;
    currentCommitteeLabel: string;
    cv: any;
  } | null>(null);

  // Set fullscreen mode on mount, reset on unmount
  useEffect(() => {
    setIsFullscreen(true);
    return () => {
      setIsFullscreen(false);
    };
  }, [setIsFullscreen]);

  useEffect(() => {
    if (!id) {
      setError('No executive member ID provided.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const db = await clientGetExecutives();
        
        let foundMember: Member | null = null;
        let committeeLabel = '';

        for (const committee of db.committees) {
          const m = committee.members.find(member => member.student_id === id);
          if (m) {
            foundMember = m;
            committeeLabel = committee.label;
            break;
          }
        }

        if (!foundMember) {
          setError('Executive member profile not found.');
          setLoading(false);
          return;
        }

        if (!foundMember.cv_link) {
          setError('This executive does not have a CV registered.');
          setLoading(false);
          return;
        }

        const currentCommitteeLabel = db.committees.find(c => c.session === db.current_committee)?.label || '';

        // Load CV JSON data
        const cv = await clientLoadCV<any>(foundMember.cv_link);

        setCvData({
          member: foundMember,
          committeeLabel,
          currentCommitteeLabel,
          cv
        });
      } catch (err) {
        console.error('Error loading CV data:', err);
        setError('Failed to load CV record.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>CV...</span></h2>
          <p className="pd">Please wait while we retrieve the academic record.</p>
        </div>
      </section>
    );
  }

  if (error || !cvData) {
    return (
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis" style={{ position: 'relative' }}>
          <h2 className="pt" style={{ color: '#f44' }}>CV <span>Not Found</span></h2>
          <p className="pd">{error || 'The requested CV details could not be loaded.'}</p>
        </div>
      </section>
    );
  }

  const { member, committeeLabel, currentCommitteeLabel, cv } = cvData;

  return (
    <section className={`${styles.pageContainer} pg active`} id="page-cv">


      <div className={styles.cvLayout}>
        <header className={styles.cvHeader}>
          <div className={styles.cvTitleBlock}>
            <h1 className={styles.cvMainTitle}>
              The Official <span className={styles.cvAccent}>Record.</span>
            </h1>
          </div>
        </header>

        <div className={styles.cvDocument}>
          <div className={styles.cvDocHeader}>
            <div className={styles.cvDocAvatar}>
              {member.icon_link ? (
                <Image src={member.icon_link} alt={member.name} width={50} height={50} className={styles.avatarImg} unoptimized />
              ) : (
                <span className={styles.avatarInitial}>{member.initial}</span>
              )}
            </div>
            <div className={styles.cvDocInfo}>
              <div className={styles.cvDocName}>{member.name}</div>
              <div className={styles.cvDocRole}>
                <span>{formatExecutiveRole(member, committeeLabel === currentCommitteeLabel).toUpperCase()} ·</span>
                <span>{cv.role}</span>
              </div>
              <div className={styles.cvDocMeta}>
                {cv.location && (
                  <span className={styles.cvDocMetaItem}>
                    <span style={{ marginRight: '0.25rem' }}>📍</span> {cv.location}
                  </span>
                )}
                {cv.email && (
                  <span className={styles.cvDocMetaItem}>
                    <span style={{ marginRight: '0.25rem' }}>✉</span> {cv.email}
                  </span>
                )}
                {cv.github && (
                  <span className={styles.cvDocMetaItem}>
                    <span style={{ marginRight: '0.25rem' }}>⌥</span> {cv.github}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.cvDocBody}>
            <aside className={styles.cvDocSide}>
              <div className={styles.cvSectionLabel}>// Education</div>
              {(cv.education || []).map((edu: any, idx: number) => (
                <div key={idx} className={styles.cvEdu}>
                  <div className={styles.cvEduDeg}>{edu.degree}</div>
                  <div className={styles.cvEduUni}>
                    <span>{edu.institution}</span>
                    <span>{edu.year}</span>
                  </div>
                  {(edu.cgpa || edu.rank) && (
                    <div className={styles.cvEduMeta}>
                      {edu.cgpa && <span>CGPA: {edu.cgpa}</span>}
                      {edu.rank && <span>Rank: {edu.rank}</span>}
                    </div>
                  )}
                </div>
              ))}

              {cv.certifications && cv.certifications.length > 0 && (
                <>
                  <div className={styles.cvSectionLabel} style={{ marginTop: '1.5rem' }}>// Certifications</div>
                  {(cv.certifications || []).map((cert: any, idx: number) => {
                    const name = typeof cert === 'string' ? cert : cert.title;
                    const link = typeof cert === 'object' ? cert.link : null;
                    return (
                      <div key={idx} className={styles.cvCert}>
                        <span style={{ marginRight: '0.25rem' }}>📜</span>
                        {link ? (
                          <a href={link} target="_blank" rel="noopener noreferrer" className={styles.cvCertLink}>
                            {name} (↗ View)
                          </a>
                        ) : (
                          <span className={styles.cvCertText}>{name}</span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {cv.languages && cv.languages.length > 0 && (
                <>
                  <div className={styles.cvSectionLabel} style={{ marginTop: '1.5rem' }}>// Languages</div>
                  <div className={styles.cvLangGrid}>
                    {(cv.languages || []).map((lang: any, idx: number) => (
                      <span key={idx} className={styles.cvLangPill}>{lang}</span>
                    ))}
                  </div>
                </>
              )}
            </aside>

            <main className={styles.cvDocMain}>
              <div className={styles.cvSectionLabel}>// Experience</div>
              {(cv.experience || []).map((exp: any, idx: number) => (
                <CVEntry
                  key={idx}
                  title={exp.title}
                  subtitle={exp.subtitle}
                  dates={exp.dates}
                  bullets={exp.bullets}
                  commas={exp.commas}
                />
              ))}

              {/* Dynamic Sections */}
              {Object.entries(cv)
                .filter(([key, value]) => {
                  const excluded = ['name', 'role', 'location', 'email', 'github', 'education', 'certifications', 'languages', 'experience'];
                  return Array.isArray(value) && !excluded.includes(key);
                })
                .map(([key, value]) => {
                  const sectionTitle = '// ' + key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <React.Fragment key={key}>
                      <div className={styles.cvSectionLabel} style={{ marginTop: '2rem' }}>{sectionTitle}</div>
                      {(value as any[]).map((item: any, idx: number) => (
                        <CVEntry
                          key={idx}
                          title={item.title}
                          subtitle={item.subtitle}
                          dates={item.dates}
                          bullets={item.bullets}
                          commas={item.commas}
                        />
                      ))}
                    </React.Fragment>
                  );
                })}
            </main>
          </div>
        </div>

        {/* VIEW PROFILE BUTTON */}
        <div className={styles.profileCallToAction}>
          <Link href={`/profile?id=${id}`} className={styles.profileButton}>
            View Profile ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CVPage() {
  return (
    <Suspense fallback={
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>CV...</span></h2>
        </div>
      </section>
    }>
      <CVContent />
    </Suspense>
  );
}
