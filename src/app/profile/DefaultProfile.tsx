'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MemberImage } from './MemberImage';
import styles from './DefaultProfile.module.css';
import { Member, Project, Achievement } from '@/lib/types';
import { formatExecutiveRole, MEDAL_ICON } from '@/lib/format';
import { useLayout } from '@/components/LayoutWrapper';
import { FitName, isLongName } from '@/components/FitName';
import { PageBar, type BarSection } from '@/components/PageBar';
import { StatGrid, type StatItem } from '@/components/StatGrid';

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

function WorkCard({ item, kind }: { item: Project; kind: 'Project' | 'Publication' }) {
  const hasLinks = !!item.demo_link || !!item.link;
  return (
    <article className={styles.card}>
      <div className={styles.cardMain}>
        <div className={styles.cardTop}>
          <span className={styles.cardKind}>{kind}</span>
          {item.year && <span className={styles.cardYear}>{item.year}</span>}
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.description && <p className={styles.cardDesc}>{item.description}</p>}
        {(item.tags || []).length > 0 && (
          <div className={styles.tagRow}>
            {item.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {hasLinks && (
        <div className={styles.cardLinks}>
          {item.demo_link && (
            <a href={item.demo_link} target="_blank" rel="noopener noreferrer" className={styles.linkSecondary}>
              Demo ↗
            </a>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.linkPrimary}>
              {kind === 'Publication' ? 'DOI ↗' : 'View Source ↗'}
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/**
 * The profile every executive gets, built only from what the database knows about them. It is designed to look
 * complete with almost nothing — a name and a role — and to grow gracefully as projects, publications,
 * honors, a bio, a photo and social links appear.
 */
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

  const isCurrent = committeeLabel === currentCommitteeLabel;
  const role = member.role?.trim() ? formatExecutiveRole(member, isCurrent) : isCurrent ? 'Executive Member' : 'Former Executive Member';
  const bio = member.bio?.trim() ?? '';
  const socials = (member.socials || []).filter((s) => s.url);
  const longName = isLongName(member.name);

  // With no bio of its own, the intro is built from the facts we do have.
  const intro = useMemo(() => {
    if (bio) return null;
    const verb = isCurrent ? 'serves' : 'served';
    const roleText = member.role?.trim() ? `as ${member.role.trim()}` : 'on the executive committee';
    const when = committeeLabel ? ` for the ${committeeLabel} committee` : '';
    return `${member.name} ${verb} ${roleText} of the Statistics Programming Club${when}.`;
  }, [bio, isCurrent, member.name, member.role, committeeLabel]);

  // "At a glance": counts, shown only when there is something to count (session and status are already in the hero).
  const glance: StatItem[] = useMemo(() => {
    const items: StatItem[] = [];
    if (projects.length > 0) items.push({ value: String(projects.length), label: projects.length === 1 ? 'Project' : 'Projects' });
    if (publications.length > 0) items.push({ value: String(publications.length), label: publications.length === 1 ? 'Publication' : 'Publications' });
    if (achievements.length > 0) items.push({ value: String(achievements.length), label: achievements.length === 1 ? 'Honor' : 'Honors' });
    return items;
  }, [projects.length, publications.length, achievements.length]);

  const hasWork = projects.length > 0 || publications.length > 0 || achievements.length > 0;

  const sections: BarSection[] = useMemo(() => {
    const list: BarSection[] = [{ id: 'about', label: 'About' }];
    if (projects.length > 0) list.push({ id: 'work', label: 'Work' });
    if (publications.length > 0) list.push({ id: 'publications', label: 'Publications' });
    if (achievements.length > 0) list.push({ id: 'honors', label: 'Honors' });
    return list;
  }, [projects.length, publications.length, achievements.length]);

  const cvHref = member.cv_link ? `/cv?id=${id}` : '';

  return (
    <div className={styles.page} id="page-profile">
      <PageBar title={member.name} sections={sections} heroId="default-name">
        {cvHref && (
          <Link href={cvHref} className={styles.barCv}>
            CV ↗
          </Link>
        )}
      </PageBar>

      <div className={styles.wrap}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.portraitCol}>
            <div className={styles.portrait}>
              <MemberImage src={member.icon_link || ''} alt={member.name} fallback={member.initial} className={styles.photo} />
            </div>
          </div>

          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>// {isCurrent ? 'Executive profile' : 'Past executive'}</span>
            <FitName
              id="default-name"
              text={member.name}
              className={`${styles.name} ${longName ? styles.nameLong : ''}`}
              maxLines={longName ? 5 : 3}
              minSize={longName ? 28 : 34}
              maxSize={92}
              maxWidthRatio={0.17}
              lineHeight={longName ? 1.04 : 0.98}
            />
            <div className={styles.role}>{role}</div>

            <div className={styles.chips}>
              {member.session && <span className={styles.chip}>Session {member.session}</span>}
              <span className={`${styles.chip} ${isCurrent ? styles.chipLive : ''}`}>{isCurrent ? 'Current committee' : 'Alumni'}</span>
            </div>

            {(socials.length > 0 || cvHref) && (
              <div className={styles.actions}>
                {cvHref && (
                  <Link href={cvHref} className={styles.cvButton}>
                    View CV ↗
                  </Link>
                )}
                {socials.map((s, idx) => (
                  <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.social}>
                    {s.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ABOUT */}
        <section className={styles.section} id="about">
          <div className={styles.sectionHead}>
            <span className={styles.sectionNumber}>01 /</span>
            <h2 className={styles.sectionTitle}>About</h2>
          </div>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <p className={styles.bio}>{bio || intro}</p>

              {uniqueTags.length > 0 && (
                <div className={styles.focus}>
                  <h3 className={styles.focusTitle}>Areas of focus</h3>
                  <div className={styles.tagRow}>
                    {uniqueTags.map((tag) => (
                      <span key={tag} className={styles.focusTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {glance.length > 0 && (
            <div className={styles.glance}>
              <h3 className={styles.focusTitle}>At a glance</h3>
              <StatGrid
                items={glance}
                columns={glance.length}
                mobileColumns={Math.min(glance.length, 3)}
                classes={{ grid: styles.glanceGrid, card: styles.glanceCard, value: styles.glanceValue, label: styles.glanceLabel }}
                valueSize={[16, 40]}
              />
            </div>
          )}
        </section>

        {/* PROJECTS */}
        {projects.length > 0 && (
          <section className={styles.section} id="work">
            <div className={styles.sectionHead}>
              <span className={styles.sectionNumber}>{String(sections.findIndex((s) => s.id === 'work') + 1).padStart(2, '0')} /</span>
              <h2 className={styles.sectionTitle}>
                Featured <span>Work</span>
              </h2>
            </div>
            <div className={styles.cardGrid} data-count={Math.min(projects.length, 2)}>
              {projects.map((p) => (
                <WorkCard key={p.title} item={p} kind="Project" />
              ))}
            </div>
          </section>
        )}

        {/* PUBLICATIONS */}
        {publications.length > 0 && (
          <section className={styles.section} id="publications">
            <div className={styles.sectionHead}>
              <span className={styles.sectionNumber}>{String(sections.findIndex((s) => s.id === 'publications') + 1).padStart(2, '0')} /</span>
              <h2 className={styles.sectionTitle}>
                Academic <span>Publications</span>
              </h2>
            </div>
            <div className={styles.cardGrid} data-count={Math.min(publications.length, 2)}>
              {publications.map((p) => (
                <WorkCard key={p.title} item={p} kind="Publication" />
              ))}
            </div>
          </section>
        )}

        {/* HONORS */}
        {achievements.length > 0 && (
          <section className={styles.section} id="honors">
            <div className={styles.sectionHead}>
              <span className={styles.sectionNumber}>{String(sections.findIndex((s) => s.id === 'honors') + 1).padStart(2, '0')} /</span>
              <h2 className={styles.sectionTitle}>
                Honors &amp; <span>Achievements</span>
              </h2>
            </div>
            <div className={styles.cardGrid} data-count={Math.min(achievements.length, 2)}>
              {achievements.map((a, idx) => (
                <article key={idx} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <span className={styles.medal} role="img" aria-label={a.tier}>
                        {MEDAL_ICON[a.tier] || '🏅'}
                      </span>
                      {a.year && <span className={styles.cardYear}>{a.year}</span>}
                    </div>
                    <h3 className={styles.cardTitle}>{a.title}</h3>
                    {a.event && <p className={styles.cardDesc}>{a.event}</p>}
                  </div>
                  {a.category && <div className={styles.cardCategory}>{a.category}</div>}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* NOTHING TO SHOW YET */}
        {!hasWork && (
          <section className={styles.section}>
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ›_
              </span>
              <div className="empty-title">Nothing listed here yet</div>
              <p className="empty-text">
                Projects, publications and honors will appear on this page as soon as they are added to the club’s records.
              </p>
            </div>
          </section>
        )}

        <div className={styles.footerNav}>
          <Link href={isCurrent ? '/exec' : '/alumni'} className={styles.backLink}>
            ← {isCurrent ? 'All executives' : 'All past executives'}
          </Link>
          <a
            href="#top"
            className={styles.toTop}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            ↑ Back to top
          </a>
        </div>
      </div>
    </div>
  );
}
