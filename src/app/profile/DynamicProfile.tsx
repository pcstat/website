'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Member, ProfileData, ProfileProject, ProfilePublication, ProfileTimelineItem } from '@/lib/types';
import { useLayout } from '@/components/LayoutWrapper';
import { FitName, isLongName } from '@/components/FitName';
import { StatGrid } from '@/components/StatGrid';
import { PageBar, type BarSection } from '@/components/PageBar';
import styles from './DynamicProfile.module.css';

interface DynamicProfileProps {
  id: string;
  data: ProfileData;
  member: Member;
}

function TagList({ tags, className }: { tags?: string[]; className: string }) {
  if (!tags || tags.length === 0) return null;
  return (
    <div className={className}>
      {tags.map((t, i) => (
        <span key={`${t}-${i}`} className={className === styles.timelineTags ? styles.timelineTag : styles.projectTag}>
          {t}
        </span>
      ))}
    </div>
  );
}

function TimelineCard({ item }: { item: ProfileTimelineItem }) {
  return (
    <div className={styles.timelineCardContainer}>
      <div className={styles.timelineYear}>
        {item.start} – {item.end}
      </div>
      <div className={styles.timelineCard}>
        <div className={styles.timelineRole}>
          {item.role}
          {item.end === 'present' && <span className={styles.currentBadge}>Current</span>}
        </div>
        {item.company && (
          <div className={styles.timelineCompany}>
            <span className={styles.companyIcon}>🏢</span>
            <span>
              {item.company}
              {item.type && <span className={styles.jobType}> · {item.type}</span>}
            </span>
          </div>
        )}
        {item.description && <div className={styles.timelineDescription}>{item.description}</div>}
        <TagList tags={item.tags} className={styles.timelineTags} />
      </div>
    </div>
  );
}

function ProjectCard({ item, featured }: { item: ProfileProject; featured: boolean }) {
  const links = item.links ?? {};
  return (
    <div className={`${styles.projectCard} ${featured ? styles.featured : ''}`}>
      <div>
        <div className={styles.projectLabel}>{featured ? '// Featured Project' : '// Project'}</div>
        <h3 className={styles.projectTitle}>{item.title}</h3>
        <p className={styles.projectDesc}>{item.description}</p>
        <TagList tags={item.tags} className={styles.projectTags} />
      </div>
      {Object.keys(links).length > 0 && (
        <div className={styles.projectFooter}>
          <div className={styles.projectLinks}>
            {links.github && (
              <a href={links.github} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                GitHub ↗
              </a>
            )}
            {links.demo && (
              <a href={links.demo} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                {featured ? 'Live Demo ↗' : 'Demo ↗'}
              </a>
            )}
            {featured && links.paper && (
              <a href={links.paper} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                Paper ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PublicationCard({ item, featured }: { item: ProfilePublication; featured: boolean }) {
  return (
    <div className={`${styles.projectCard} ${featured ? styles.featured : ''}`}>
      <div>
        <div className={styles.projectLabel}>{featured ? '// Featured Publication' : '// Publication'}</div>
        <h3 className={styles.projectTitle}>{item.title}</h3>
        <div className={styles.pubVenue}>{item.venue}</div>
        <TagList tags={item.tags} className={styles.projectTags} />
      </div>
      {item.links?.paper && (
        <div className={styles.projectFooter}>
          <div className={styles.projectLinks}>
            <a href={item.links.paper} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
              View Paper ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function DynamicProfile({ id, data, member }: DynamicProfileProps) {
  const { setIsFullscreen } = useLayout();
  const [imageError, setImageError] = useState(false);

  // Set fullscreen mode on mount, reset on unmount
  useEffect(() => {
    setIsFullscreen(true);
    return () => {
      setIsFullscreen(false);
    };
  }, [setIsFullscreen]);

  // Fallbacks from member data if JSON is sparse
  const profileName = data.name || member.name;
  const profileRole = data.role || member.role || 'Executive Member';
  const profileBio = data.bio || member.bio || '';
  const profilePhoto = data.photo || member.icon_link || '';
  const socials = data.socials || member.socials || [];
  const sessionVal = data.session || member.session;

  // Resolve CV Link: if it is a JSON file (ends with .json or has .json) or is /cv / cv, route to /cv?id=...
  let cvHref = data.cv_link || member.cv_link;
  if (cvHref) {
    const isJson = cvHref.toLowerCase().includes('.json');
    if (cvHref === '/cv' || cvHref === 'cv' || isJson) cvHref = `/cv?id=${id}`;
  } else {
    cvHref = '';
  }

  const allProjects = data.projects || [];
  const featuredProjects = allProjects.filter((p) => p.featured);
  const regularProjects = allProjects.filter((p) => !p.featured);

  const allPublications = data.publications || [];
  const featuredPublications = allPublications.filter((p) => p.featured);
  const regularPublications = allPublications.filter((p) => !p.featured);

  // Newest first; "present" counts as newest. Sorted on a copy — never mutate the data.
  const timeline = useMemo(
    () =>
      [...(data.timeline || [])].sort((a, b) => {
        const yearA = a.start === 'present' ? 9999 : parseInt(a.start);
        const yearB = b.start === 'present' ? 9999 : parseInt(b.start);
        return yearB - yearA;
      }),
    [data.timeline],
  );

  const hasSkills = !!data.skills && data.skills.length > 0;
  const hasAchievements = !!data.achievements && data.achievements.length > 0;

  // Sections in page order — also drives the numbering and the links in the top bar.
  const sections = useMemo(() => {
    const list: BarSection[] = [{ id: 'bio', label: 'Biography' }];
    if (timeline.length > 0) list.push({ id: 'experience', label: 'Experience' });
    if (hasSkills) list.push({ id: 'expertise', label: 'Expertise' });
    if (allProjects.length > 0) list.push({ id: 'work', label: 'Work' });
    if (allPublications.length > 0) list.push({ id: 'publications', label: 'Publications' });
    if (hasAchievements) list.push({ id: 'achievements', label: 'Achievements' });
    return list;
  }, [timeline.length, hasSkills, allProjects.length, allPublications.length, hasAchievements]);

  const num = (sectionId: string) => String(sections.findIndex((s) => s.id === sectionId) + 1).padStart(2, '0');
  const longName = isLongName(profileName);

  return (
    <div className={styles.fullscreenContainer}>
      <PageBar title={profileName} sections={sections} heroId="profile-name">
        {cvHref && (
          <Link href={cvHref} className={styles.barCv}>
            CV ↗
          </Link>
        )}
      </PageBar>

      <div className={styles.contentWrapper}>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            {data.tagline && <span className={styles.heroTagline}>// {data.tagline}</span>}
            <FitName
              id="profile-name"
              text={profileName}
              className={`${styles.heroName} ${longName ? styles.heroNameLong : ''}`}
              maxLines={longName ? 5 : 3}
              minSize={longName ? 30 : 36}
              lineHeight={longName ? 1.02 : 0.95}
            />
            <div className={styles.heroRole}>{profileRole}</div>
            {data.subtitle && <div className={styles.heroSubtitle}>{data.subtitle}</div>}

            {socials.length > 0 && (
              <div className={styles.socialsList}>
                {socials.map((s, idx) => (
                  <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer" className={styles.socialItem}>
                    {s.label} ↗
                  </a>
                ))}
              </div>
            )}
          </div>

          {data.stats && data.stats.length > 0 && (
            <div className={styles.heroRight}>
              <StatGrid
                items={data.stats}
                mobileColumns={Math.min(data.stats.length, 2)}
                classes={{ grid: styles.statsGrid, card: styles.statCard, value: styles.statValue, label: styles.statLabel }}
              />
            </div>
          )}
        </section>

        {/* ABOUT SECTION */}
        <section className={styles.aboutSection} id="bio">
          <span className={styles.sectionNumber}>{num('bio')} /</span>
          <h2 className={styles.masthead}>Biography</h2>

          <div className={styles.aboutGrid}>
            <div className={styles.aboutSidebar}>
              <div className={styles.imageFrame}>
                {profilePhoto && !imageError ? (
                  <Image
                    src={profilePhoto}
                    alt={profileName}
                    width={320}
                    height={320}
                    className={styles.profileImage}
                    onError={() => setImageError(true)}
                    unoptimized
                    priority
                  />
                ) : (
                  <div>{member.initial}</div>
                )}
              </div>

              <div className={styles.sidebarMeta}>
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>Session</span>
                  <span className={styles.metaValue}>{sessionVal}</span>
                </div>
                {data.location && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Location</span>
                    <span className={styles.metaValue}>{data.location}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.aboutMain}>
              {profileBio && <div className={styles.bioText}>{profileBio}</div>}

              {data.focus_areas && data.focus_areas.length > 0 && (
                <div className={styles.focusAreas}>
                  <h3 className={styles.subHeading}>Focus Areas</h3>
                  <div className={styles.focusPills}>
                    {data.focus_areas.map((area) => (
                      <span key={area} className={styles.focusPill}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* TIMELINE SECTION */}
        {timeline.length > 0 && (
          <section className={styles.timelineSection} id="experience">
            <span className={styles.sectionNumber}>{num('experience')} /</span>
            <h2 className={styles.masthead}>Experience</h2>

            <div className={styles.timelineWrapper}>
              <div className={styles.timelineSpine}></div>

              {timeline.map((item, idx) => {
                const isLeft = idx % 2 === 0;
                return (
                  <div key={idx} className={styles.timelineRow}>
                    <div className={`${styles.timelineSlot} ${isLeft ? styles.leftSlot : styles.emptySlot}`}>
                      {isLeft && <TimelineCard item={item} />}
                    </div>

                    <div className={styles.timelineCenter}>
                      <div className={`${styles.timelineNode} ${item.end === 'present' ? styles.currentNode : ''}`}></div>
                      {idx !== timeline.length - 1 && <div className={styles.timelineConnector}></div>}
                    </div>

                    <div className={`${styles.timelineSlot} ${!isLeft ? styles.rightSlot : styles.emptySlot}`}>
                      {!isLeft && <TimelineCard item={item} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SKILLS SECTION */}
        {hasSkills && (
          <section className={styles.skillsSection} id="expertise">
            <span className={styles.sectionNumber}>{num('expertise')} /</span>
            <h2 className={styles.masthead}>Expertise</h2>

            <div className={styles.skillsGrid}>
              {data.skills!.map((group, idx) => (
                <div key={idx} className={styles.skillCategoryCard}>
                  <div className={styles.skillCategoryHeader}>
                    {group.icon && (
                      <span className={styles.skillIcon} role="img" aria-label={group.category}>
                        {group.icon === 'brain' ? '🧠' : group.icon === 'tools' ? '🛠️' : '💻'}
                      </span>
                    )}
                    <h3 className={styles.skillCategoryTitle}>{group.category}</h3>
                  </div>
                  <div className={styles.skillPills}>
                    {group.items.map((skill) => (
                      <span key={skill} className={styles.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PROJECTS SECTION */}
        {allProjects.length > 0 && (
          <section className={styles.projectsSection} id="work">
            <span className={styles.sectionNumber}>{num('work')} /</span>
            <h2 className={styles.masthead}>Featured Work</h2>

            <div className={styles.projectsGrid}>
              {featuredProjects.map((p, idx) => (
                <ProjectCard key={`f-${idx}`} item={p} featured />
              ))}
              {regularProjects.map((p, idx) => (
                <ProjectCard key={`r-${idx}`} item={p} featured={false} />
              ))}
            </div>
          </section>
        )}

        {/* PUBLICATIONS SECTION */}
        {allPublications.length > 0 && (
          <section className={styles.publicationsSection} id="publications">
            <span className={styles.sectionNumber}>{num('publications')} /</span>
            <h2 className={styles.masthead}>Publications</h2>

            <div className={styles.projectsGrid}>
              {featuredPublications.map((p, idx) => (
                <PublicationCard key={`f-${idx}`} item={p} featured />
              ))}
              {regularPublications.map((p, idx) => (
                <PublicationCard key={`r-${idx}`} item={p} featured={false} />
              ))}
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS SECTION */}
        {hasAchievements && (
          <section className={styles.achievementsSection} id="achievements">
            <span className={styles.sectionNumber}>{num('achievements')} /</span>
            <h2 className={styles.masthead}>Achievements</h2>

            <div className={styles.achievementsGrid}>
              {data.achievements!.map((a, idx) => (
                <div key={idx} className={styles.achievementCard}>
                  <div className={styles.achievementHeader}>
                    <h3 className={styles.achievementTitle}>{a.title}</h3>
                    <span className={styles.achievementYear}>{a.year}</span>
                  </div>
                  <p className={styles.achievementDetails}>{a.event}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CV CALL-TO-ACTION */}
        <section className={styles.cvCtaSection}>
          {cvHref && (
            <Link href={cvHref} className={styles.cvButton}>
              View Full CV ↗
            </Link>
          )}
          <a href="#top" className={styles.toTop} onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            ↑ Back to top
          </a>
        </section>
      </div>
    </div>
  );
}
