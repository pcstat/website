'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Member, ProfileData } from '@/lib/types';
import { useLayout } from '@/components/LayoutWrapper';
import { useTheme } from '@/context/ThemeContext';
import styles from './DynamicProfile.module.css';

// SVG Icons for Theme Toggle (scaled to fit switch thumb)
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

interface DynamicProfileProps {
  id: string;
  data: ProfileData;
  member: Member;
}

export function DynamicProfile({ id, data, member }: DynamicProfileProps) {
  const { setIsFullscreen } = useLayout();
  const { theme, toggleTheme } = useTheme();

  // Set fullscreen mode on mount, reset on unmount
  useEffect(() => {
    setIsFullscreen(true);
    return () => {
      setIsFullscreen(false);
    };
  }, [setIsFullscreen]);

  // Fallbacks from member data if JSON is sparse
  const profileName = data.name || member.name;
  const profileRole = data.role || member.role || "Executive Member";
  const profileBio = data.bio || member.bio || "";
  const profilePhoto = data.photo || member.icon_link || "";
  const socials = data.socials || member.socials || [];
  const sessionVal = data.session || member.session;

  // Resolve CV Link: if it is a JSON file (ends with .json or has .json) or is /cv / cv, route to /cv?id=...
  let cvHref = data.cv_link || member.cv_link;
  if (cvHref) {
    const isJson = cvHref.toLowerCase().endsWith('.json') || cvHref.toLowerCase().includes('.json');
    if (cvHref === '/cv' || cvHref === 'cv' || isJson) {
      cvHref = `/cv?id=${id}`;
    }
  } else {
    cvHref = '';
  }

  // Filter projects by featured
  const allProjects = data.projects || [];
  const featuredProjects = allProjects.filter(p => p.featured);
  const regularProjects = allProjects.filter(p => !p.featured);

  // Filter publications by featured
  const allPublications = data.publications || [];
  const featuredPublications = allPublications.filter(p => p.featured);
  const regularPublications = allPublications.filter(p => !p.featured);

  // Fallback for missing photos
  const [imageError, setImageError] = React.useState(false);

  // Calculate dynamic section numbers
  let sectionCount = 0;
  const getNextSectionNum = () => {
    sectionCount++;
    return sectionCount.toString().padStart(2, '0');
  };

  return (
    <div className={styles.fullscreenContainer}>
      <div className={styles.contentWrapper}>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroLeft}>
            {data.tagline && (
              <span className={styles.heroTagline}>// {data.tagline}</span>
            )}
            <h1 className={styles.heroName}>{profileName}</h1>
            <div className={styles.heroRole}>{profileRole}</div>
            {data.subtitle && (
              <div className={styles.heroSubtitle}>{data.subtitle}</div>
            )}

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
              <div className={styles.statsGrid}>
                {data.stats.map((stat, idx) => (
                  <div key={idx} className={styles.statCard}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ABOUT SECTION */}
        <section className={styles.aboutSection}>
          <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
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
              {profileBio && (
                <div className={styles.bioText}>
                  {profileBio}
                </div>
              )}

              {data.focus_areas && data.focus_areas.length > 0 && (
                <div className={styles.focusAreas}>
                  <h3 className={styles.subHeading}>Focus Areas</h3>
                  <div className={styles.focusPills}>
                    {data.focus_areas.map(area => (
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
        {data.timeline && data.timeline.length > 0 && (
          <section className={styles.timelineSection}>
            <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
            <h2 className={styles.masthead}>Experience</h2>

            <div className={styles.timelineWrapper}>
              <div className={styles.timelineSpine}></div>

              {data.timeline
                .sort((a, b) => {
                  const yearA = a.start === 'present' ? 9999 : parseInt(a.start);
                  const yearB = b.start === 'present' ? 9999 : parseInt(b.start);
                  return yearB - yearA;
                })
                .map((item, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={idx} className={styles.timelineRow}>
                      <div className={`${styles.timelineSlot} ${isLeft ? styles.leftSlot : styles.emptySlot}`}>
                        {isLeft && (
                          <div className={styles.timelineCardContainer}>
                            <div className={styles.timelineYear}>{item.start} – {item.end}</div>
                            <div className={styles.timelineCard}>
                              <div className={styles.timelineRole}>
                                {item.role}
                                {item.end === 'present' && <span className={styles.currentBadge}>Current</span>}
                              </div>
                              {item.company && (
                                <div className={styles.timelineCompany}>
                                  <span className={styles.companyIcon}>🏢</span>
                                  {item.company}
                                  {item.type && <span className={styles.jobType}> · {item.type}</span>}
                                </div>
                              )}
                              {item.description && (
                                <div className={styles.timelineDescription}>{item.description}</div>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className={styles.timelineTags}>
                                  {item.tags.map((tag, tagIdx) => (
                                    <span key={tagIdx} className={styles.timelineTag}>{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.timelineCenter}>
                        <div className={`${styles.timelineNode} ${item.end === 'present' ? styles.currentNode : ''}`}></div>
                        {idx !== data.timeline.length - 1 && <div className={styles.timelineConnector}></div>}
                      </div>

                      <div className={`${styles.timelineSlot} ${!isLeft ? styles.rightSlot : styles.emptySlot}`}>
                        {!isLeft && (
                          <div className={styles.timelineCardContainer}>
                            <div className={styles.timelineYear}>{item.start} – {item.end}</div>
                            <div className={styles.timelineCard}>
                              <div className={styles.timelineRole}>
                                {item.role}
                                {item.end === 'present' && <span className={styles.currentBadge}>Current</span>}
                              </div>
                              {item.company && (
                                <div className={styles.timelineCompany}>
                                  <span className={styles.companyIcon}>🏢</span>
                                  {item.company}
                                  {item.type && <span className={styles.jobType}> · {item.type}</span>}
                                </div>
                              )}
                              {item.description && (
                                <div className={styles.timelineDescription}>{item.description}</div>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className={styles.timelineTags}>
                                  {item.tags.map((tag, tagIdx) => (
                                    <span key={tagIdx} className={styles.timelineTag}>{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* SKILLS SECTION */}
        {data.skills && data.skills.length > 0 && (
          <section className={styles.skillsSection}>
            <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
            <h2 className={styles.masthead}>Expertise</h2>

            <div className={styles.skillsGrid}>
              {data.skills.map((group, idx) => (
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
                    {group.items.map(skill => (
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
          <section className={styles.projectsSection}>
            <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
            <h2 className={styles.masthead}>Featured Work</h2>

            <div className={styles.projectsGrid}>
              {featuredProjects.map((p, idx) => (
                <div key={idx} className={`${styles.projectCard} ${styles.featured}`}>
                  <div>
                    <div className={styles.projectLabel}>// Featured Project</div>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <p className={styles.projectDesc}>{p.description}</p>
                    {p.tags && p.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {p.tags.map(t => (
                          <span key={t} className={styles.projectTag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.links && Object.keys(p.links).length > 0 && (
                    <div className={styles.projectFooter}>
                      <div className={styles.projectLinks}>
                        {p.links.github && (
                          <a href={p.links.github} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            GitHub ↗
                          </a>
                        )}
                        {p.links.demo && (
                          <a href={p.links.demo} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            Live Demo ↗
                          </a>
                        )}
                        {p.links.paper && (
                          <a href={p.links.paper} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            Paper ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {regularProjects.map((p, idx) => (
                <div key={idx} className={styles.projectCard}>
                  <div>
                    <div className={styles.projectLabel}>// Project</div>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <p className={styles.projectDesc}>{p.description}</p>
                    {p.tags && p.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {p.tags.map(t => (
                          <span key={t} className={styles.projectTag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.links && Object.keys(p.links).length > 0 && (
                    <div className={styles.projectFooter}>
                      <div className={styles.projectLinks}>
                        {p.links.github && (
                          <a href={p.links.github} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            GitHub ↗
                          </a>
                        )}
                        {p.links.demo && (
                          <a href={p.links.demo} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PUBLICATIONS SECTION */}
        {allPublications.length > 0 && (
          <section className={styles.publicationsSection}>
            <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
            <h2 className={styles.masthead}>Publications</h2>

            <div className={styles.projectsGrid}>
              {featuredPublications.map((p, idx) => (
                <div key={idx} className={`${styles.projectCard} ${styles.featured}`}>
                  <div>
                    <div className={styles.projectLabel}>// Featured Publication</div>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <div className={styles.pubVenue}>{p.venue}</div>
                    {p.tags && p.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {p.tags.map(t => (
                          <span key={t} className={styles.projectTag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.links && p.links.paper && (
                    <div className={styles.projectFooter}>
                      <div className={styles.projectLinks}>
                        <a href={p.links.paper} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                          View Paper ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {regularPublications.map((p, idx) => (
                <div key={idx} className={styles.projectCard}>
                  <div>
                    <div className={styles.projectLabel}>// Publication</div>
                    <h3 className={styles.projectTitle}>{p.title}</h3>
                    <div className={styles.pubVenue}>{p.venue}</div>
                    {p.tags && p.tags.length > 0 && (
                      <div className={styles.projectTags}>
                        {p.tags.map(t => (
                          <span key={t} className={styles.projectTag}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.links && p.links.paper && (
                    <div className={styles.projectFooter}>
                      <div className={styles.projectLinks}>
                        <a href={p.links.paper} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                          View Paper ↗
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS SECTION */}
        {data.achievements && data.achievements.length > 0 && (
          <section className={styles.achievementsSection}>
            <span className={styles.sectionNumber}>{getNextSectionNum()} /</span>
            <h2 className={styles.masthead}>Achievements</h2>

            <div className={styles.achievementsGrid}>
              {data.achievements.map((a, idx) => (
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
        {cvHref && (
          <section className={styles.cvCtaSection}>
            <Link href={cvHref} className={styles.cvButton}>
              View Full CV ↗
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
