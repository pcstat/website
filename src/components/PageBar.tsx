'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import styles from './PageBar.module.css';

export interface BarSection {
  id: string;
  label: string;
}

interface PageBarProps {
  /** The person's name; shown (truncated if long) once the page heading has scrolled out of view. */
  title: string;
  /** Anchors for the in-page section links. */
  sections?: BarSection[];
  /** Id of the heading element whose visibility decides when the title appears. */
  heroId?: string;
  /** Extra controls (buttons / links) placed before the theme toggle. */
  children?: React.ReactNode;
}

const SUN = (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.41 1.41M18.37 18.37l1.41 1.41M1 12h2M21 12h2M4.22 19.78l1.41-1.41M18.37 5.63l1.41-1.41" />
  </svg>
);

const MOON = (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/** Slim fixed bar for the long personal pages (profile, CV): back button, section links, reading progress. */
export function PageBar({ title, sections = [], heroId, children }: PageBarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState<string>('');
  const [showTitle, setShowTitle] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // Reading progress.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Which section is being read.
  useEffect(() => {
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Show the name in the bar once the big heading is gone.
  useEffect(() => {
    if (!heroId) return;
    const el = document.getElementById(heroId);
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowTitle(!entry.isIntersecting), { rootMargin: '-60px 0px 0px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [heroId, title]);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/exec');
  };

  return (
    <header className={styles.bar}>
      <div className={styles.inner}>
        <button type="button" className={styles.back} onClick={goBack}>
          <span aria-hidden="true">←</span> Back
        </button>

        <span className={`${styles.title} ${showTitle ? styles.titleOn : ''}`} aria-hidden={!showTitle}>
          {title}
        </span>

        {sections.length > 0 && (
          <nav className={styles.sections} aria-label="Sections">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={`${styles.sec} ${active === s.id ? styles.secOn : ''}`}>
                {s.label}
              </a>
            ))}
          </nav>
        )}

        <div className={styles.actions}>
          {children}
          <button type="button" className={styles.icon} onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
            {theme === 'dark' ? SUN : MOON}
          </button>
        </div>
      </div>
      <div className={styles.progress} ref={progressRef} />
    </header>
  );
}
