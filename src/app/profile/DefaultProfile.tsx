'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { MemberImage } from './MemberImage';
import styles from './DefaultProfile.module.css';
import { Member, Project, Achievement } from '@/lib/types';
import { formatExecutiveRole, MEDAL_ICON } from '@/lib/clientData';
import { useLayout } from '@/components/LayoutWrapper';

interface DefaultProfileProps {
  id: string;
  member: Member;
  committeeLabel: string;
  currentCommitteeLabel: string;
  projects: Project[];
  publications: Project[];
  achievements: Achievement[];
  uniqueTags: string[];
}

export function DefaultProfile({
  id,
  member,
  committeeLabel,
  currentCommitteeLabel,
  projects,
  publications,
  achievements,
  uniqueTags,
}: DefaultProfileProps) {
  const { setIsFullscreen } = useLayout();

  useEffect(() => {
    setIsFullscreen(true);
    return () => setIsFullscreen(false);
  }, [setIsFullscreen]);

  return (
    <section className={`${styles.pageContainer} pg active`} id="page-profile">
      <div className="ph rv vis" style={{ position: 'relative' }}>
        <div className="pe">// Executive Profile</div>
      </div>

      {/* SECTION II: PROFILE (About) */}
      <div className={styles.profileSection}>
        <div className={styles.profileSidebar}>
          <div className={styles.avatarCircle}>
            <MemberImage
              src={member.icon_link || ''}
              alt={member.name}
              fallback={member.initial}
              className={styles.memberPhoto}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className={styles.avatarName}>{member.name}</div>
            <div className={styles.avatarRole}>
              {member.role_display || `// ${formatExecutiveRole(member, committeeLabel === currentCommitteeLabel).toUpperCase()}`}
            </div>
          </div>
          <div className={styles.memberDetails}>
            <div className={styles.detailRow}>
              <span>Session: {member.session}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Committee: {committeeLabel}</span>
            </div>
          </div>
        </div>

        <div className={styles.profileMain}>
          <div className={styles.profileBio}>
            <span className={styles.profileBioQuote}>|</span>
            {member.bio}
          </div>

          <div className={`${styles.socialLinks} ${styles.mobileSocialLinks}`}>
            {(member.socials || []).map((s, idx) => (
              <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                {s.label} ↗
              </a>
            ))}
          </div>

          <div>
            <div className={styles.focusHeader}>
              Areas of Focus
            </div>
            <div className={styles.focusTags}>
              {uniqueTags.map(tag => (
                <span key={tag} className={styles.focusTag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.socialLinks} ${styles.desktopSocialLinks}`}>
        {(member.socials || []).map((s, idx) => (
          <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            {s.label} ↗
          </a>
        ))}
      </div>

      {/* SECTION III: WORK (Projects) */}
      {projects.length > 0 && (
        <div className={styles.workSection}>
          <h3 className={styles.workTitle}>
            Featured <span className={styles.workTitleAccent}>Work</span>
          </h3>

          <div className={styles.workList}>
            {projects.map((p, idx) => {
              const isOdd = (idx + 1) % 2 !== 0;
              return (
                <div key={p.title} className={`${styles.portfolioCard} ${isOdd ? styles.workItemOdd : styles.workItemEven} portfolio-card`} >
                  {isOdd && (
                    <div className={styles.workItemVisual}>
                      <div className={styles.workItemNumber}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                  <div className={styles.workItemContent}>
                    <div>
                      <div className={styles.workItemLabel}>
                        Project
                      </div>
                      <h4 className={styles.workItemHeading}>
                        {p.title}
                      </h4>
                      <p className={styles.workItemDesc}>
                        {p.description}
                      </p>
                      <div className={styles.workItemTags}>
                        {(p.tags || []).map(tag => (
                          <span key={tag} className={styles.workItemTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.workItemFooter}>
                      <div className={styles.workItemYear}>
                        {p.year}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {p.demo_link && (
                          <a href={p.demo_link} target="_blank" rel="noopener noreferrer" className="portfolio-btn portfolio-btn-secondary">
                            Demo ↗
                          </a>
                        )}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="portfolio-btn portfolio-btn-primary">
                            View Source ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isOdd && (
                    <div className={styles.workItemVisual}>
                      <div className={styles.workItemNumber}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION III.B: PUBLICATIONS */}
      {publications.length > 0 && (
        <div className={styles.publicationsSection}>
          <h3 className={styles.workTitle}>
            Academic <span className={styles.workTitleAccent}>Publications</span>
          </h3>
          <div className={styles.workList}>
            {publications.map((p, idx) => {
              const isOdd = (idx + 1) % 2 !== 0;
              return (
                <div key={p.title} className={`${styles.portfolioCard} ${isOdd ? styles.workItemOdd : styles.workItemEven} portfolio-card`} >
                  {isOdd && (
                    <div className={styles.workItemVisual}>
                      <div className={styles.workItemNumber}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                  <div className={styles.workItemContent}>
                    <div>
                      <div className={styles.workItemLabel}>
                        Publication
                      </div>
                      <h4 className={styles.workItemHeading}>
                        {p.title}
                      </h4>
                      <p className={styles.workItemDesc}>
                        {p.description}
                      </p>
                      <div className={styles.workItemTags}>
                        {(p.tags || []).map(tag => (
                          <span key={tag} className={styles.workItemTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.workItemFooter}>
                      <div className={styles.workItemYear}>
                        {p.year}
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {p.demo_link && (
                          <a href={p.demo_link} target="_blank" rel="noopener noreferrer" className="portfolio-btn portfolio-btn-secondary">
                            Demo ↗
                          </a>
                        )}
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noopener noreferrer" className="portfolio-btn portfolio-btn-primary">
                            DOI ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isOdd && (
                    <div className={styles.workItemVisual}>
                      <div className={styles.workItemNumber}>
                        {(idx + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION IV: ACHIEVEMENTS */}
      {achievements.length > 0 && (
        <div className={styles.achievementsSection}>
          <h3 className={styles.workTitle}>
            Honors & <span className={styles.workTitleAccent}>Achievements</span>
          </h3>
          <div className={styles.achievementsGrid}>
            {achievements.map((a, idx) => (
              <div key={idx} className={`${styles.achievementCard} portfolio-card`}>
                <div className={styles.achievementCardHeader}>
                  <div className={styles.achievementCardTitle}>
                    <span style={{ fontSize: '1.5rem' }}>{MEDAL_ICON[a.tier] || '🏅'}</span>
                    <div className={styles.achievementCardTitleText}>{a.title}</div>
                  </div>
                  <div className={styles.achievementYear}>
                    {a.year}
                  </div>
                </div>
                <div className={styles.achievementDetails}>
                  {a.event}
                </div>
                <div className={styles.achievementCategory}>
                  {a.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {member.cv_link && (
        <div className={styles.cvCallToAction}>
          <Link href={`/cv?id=${id}`} className="portfolio-btn portfolio-btn-primary portfolio-btn-lg">
            VIEW FULL CV ↗
          </Link>
        </div>
      )}
    </section>
  );
}
