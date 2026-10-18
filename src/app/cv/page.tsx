'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePreview } from '@/lib/preview';
import Link from 'next/link';
import Image from 'next/image';
import styles from './cv.module.css';
import { clientGetExecutives, clientLoadCV } from '@/lib/database/client';
import { formatExecutiveRole } from '@/lib/format';
import type { Member } from '@/lib/types';
import { useLayout } from '@/components/LayoutWrapper';
import { FitName } from '@/components/FitName';
import { PageBar } from '@/components/PageBar';
import { CV_HEADER_KEYS, linkFor, shortUrl, usable } from './cvFormat';
import { PrintCV } from './PrintCV';

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

function CVEntry({ title, subtitle, location, link, dates, bullets, commas }: { title?: string; subtitle?: string; location?: string; link?: string; dates?: string; bullets?: any[]; commas?: any[] }) {
  return (
    <div className={styles.cvExpBlock}>
      <div className={styles.cvExpHeader}>
        <span className={styles.cvExpRole}>
          {title}
          {usable(link) && (
            <a className={styles.cvExpLink} href={linkFor('website', link)} target="_blank" rel="noopener noreferrer" aria-label={`${title ?? 'Project'} link`}>
              {' '}↗
            </a>
          )}
        </span>
        {dates && <span className={styles.cvExpDates}>{dates}</span>}
      </div>
      {(subtitle || usable(location)) && <div className={styles.cvExpCompany}>{[subtitle, usable(location) ? location : ''].filter(Boolean).join('  ·  ')}</div>}
      <RenderList bullets={bullets} format="bullets" />
      <RenderList bullets={commas} format="commas" />
    </div>
  );
}

function CVContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  // Inside the admin panel's live preview the page reloads its data whenever a new draft arrives.
  const previewRev = usePreview()?.rev ?? 0;

  const { setIsFullscreen } = useLayout();

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
  }, [id, previewRev]);

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
  // The name always comes from the member's entry in Executives (as before) — the CV file does not carry one.
  const displayName: string = member.name;
  const role = formatExecutiveRole(member, committeeLabel === currentCommitteeLabel).toUpperCase();

  return (
    <section className={`${styles.pageContainer} pg active`} id="page-cv">
      <PageBar title={displayName} heroId="cv-name">
        <button type="button" className={styles.barButton} onClick={() => window.print()}>
          Print / PDF
        </button>
        <Link href={`/profile?id=${id}`} className={styles.barLink}>
          Profile ↗
        </Link>
      </PageBar>

      <div className={styles.cvLayout}>
        <header className={styles.cvHeader}>
          <div className={styles.cvTitleBlock}>
            <span className={styles.cvEyebrow}>// Curriculum vitae</span>
            <h1 className={styles.cvMainTitle}>
              The Official <span className={styles.cvAccent}>Record.</span>
            </h1>
          </div>
        </header>

        <div className={styles.cvDocument}>
          <div className={styles.cvDocHeader}>
            <div className={styles.cvDocAvatar}>
              {member.icon_link ? (
                <Image src={member.icon_link} alt={member.name} width={76} height={76} className={styles.avatarImg} unoptimized />
              ) : (
                <span className={styles.avatarInitial}>{member.initial}</span>
              )}
            </div>
            <div className={styles.cvDocInfo}>
              <FitName
                id="cv-name"
                as="h2"
                text={displayName}
                className={styles.cvDocName}
                maxLines={3}
                minSize={20}
                maxSize={38}
                maxWidthRatio={0.1}
                lineHeight={1.1}
              />
              <div className={styles.cvDocRole}>
                <span>{role}</span>
                {cv.role && <span className={styles.cvDocRoleSep}>·</span>}
                {cv.role && <span>{cv.role}</span>}
              </div>
              <div className={styles.cvDocMeta}>
                {usable(cv.location) && (
                  <span className={styles.cvDocMetaItem}>
                    <span aria-hidden="true">📍</span> {cv.location}
                  </span>
                )}
                {usable(cv.email) && (
                  <a className={`${styles.cvDocMetaItem} ${styles.cvDocMetaLink}`} href={linkFor('email', cv.email)}>
                    <span aria-hidden="true">✉</span> {cv.email}
                  </a>
                )}
                {usable(cv.phone) && (
                  <a className={`${styles.cvDocMetaItem} ${styles.cvDocMetaLink}`} href={linkFor('phone', cv.phone)}>
                    <span aria-hidden="true">☎</span> {cv.phone}
                  </a>
                )}
                {usable(cv.github) && (
                  <a className={`${styles.cvDocMetaItem} ${styles.cvDocMetaLink}`} href={linkFor('github', cv.github)} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">⌥</span> {cv.github}
                  </a>
                )}
                {usable(cv.linkedin) && (
                  <a className={`${styles.cvDocMetaItem} ${styles.cvDocMetaLink}`} href={linkFor('linkedin', cv.linkedin)} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">in</span> {shortUrl(cv.linkedin)}
                  </a>
                )}
                {usable(cv.website) && (
                  <a className={`${styles.cvDocMetaItem} ${styles.cvDocMetaLink}`} href={linkFor('website', cv.website)} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">🔗</span> {shortUrl(cv.website)}
                  </a>
                )}
              </div>
            </div>
          </div>

          {usable(cv.summary) && (
            <div className={styles.cvSummary}>
              <div className={styles.cvSectionLabel}>// Summary</div>
              <p className={styles.cvSummaryText}>{cv.summary}</p>
            </div>
          )}

          <div className={styles.cvDocBody}>
            <aside className={styles.cvDocSide}>
              {(cv.education || []).length > 0 && <div className={styles.cvSectionLabel}>// Education</div>}
              {(cv.education || []).map((edu: any, idx: number) => (
                <div key={idx} className={styles.cvEdu}>
                  <div className={styles.cvEduDeg}>{edu.degree}</div>
                  <div className={styles.cvEduUni}>
                    <span>{edu.institution}</span>
                    {usable(edu.year) && <span>{edu.year}</span>}
                  </div>
                  {(usable(edu.cgpa) || usable(edu.rank)) && (
                    <div className={styles.cvEduMeta}>
                      {usable(edu.cgpa) && <span>CGPA: {edu.cgpa}</span>}
                      {usable(edu.rank) && <span>Rank: {edu.rank}</span>}
                    </div>
                  )}
                  {usable(edu.honors) && <div className={styles.cvEduNote}>{edu.honors}</div>}
                  {usable(edu.thesis) && <div className={styles.cvEduNote}><strong>Thesis:</strong> {edu.thesis}</div>}
                  {Array.isArray(edu.coursework) && edu.coursework.length > 0 && (
                    <div className={styles.cvEduNote}><strong>Coursework:</strong> {edu.coursework.join(', ')}</div>
                  )}
                </div>
              ))}

              {cv.certifications && cv.certifications.length > 0 && (
                <>
                  <div className={`${styles.cvSectionLabel} ${styles.cvSectionGap}`}>// Certifications</div>
                  {(cv.certifications || []).map((cert: any, idx: number) => {
                    const name = typeof cert === 'string' ? cert : cert.title;
                    const link = typeof cert === 'object' ? cert.link : null;
                    return (
                      <div key={idx} className={styles.cvCert}>
                        <span aria-hidden="true">📜</span>
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
                  <div className={`${styles.cvSectionLabel} ${styles.cvSectionGap}`}>// Languages</div>
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
                  location={exp.location}
                  link={exp.link}
                  dates={exp.dates}
                  bullets={exp.bullets}
                  commas={exp.commas}
                />
              ))}

              {/* Dynamic Sections */}
              {Object.entries(cv)
                .filter(([key, value]) => {
                  const excluded = [...CV_HEADER_KEYS, 'education', 'certifications', 'languages', 'experience'];
                  return Array.isArray(value) && !excluded.includes(key);
                })
                .map(([key, value]) => {
                  const sectionTitle = '// ' + key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <React.Fragment key={key}>
                      <div className={`${styles.cvSectionLabel} ${styles.cvSectionGap}`}>{sectionTitle}</div>
                      {(value as any[]).map((item: any, idx: number) => (
                        <CVEntry
                          key={idx}
                          title={item.title}
                          subtitle={item.subtitle}
                          location={item.location}
                          link={item.link}
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

      {/* What the browser prints: a one-column CV (the styled layout above is hidden in print). */}
      <PrintCV name={displayName} role={role} cv={cv} />
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
