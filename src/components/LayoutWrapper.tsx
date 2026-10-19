'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { useSite } from '@/lib/site';
import { Icon } from './Icon';

export interface LayoutContextType {
  isFullscreen: boolean;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider / LayoutWrapper');
  }
  return context;
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { club, nav } = useSite();
  // The sidebar comes from site.json (edited in the admin panel). Courses & certificates are prototypes and are not listed.
  const NAV_ITEMS = nav.map((item) => ({ name: item.label, path: item.path, icon: item.icon }));
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // Label shown beside an icon of the collapsed sidebar. It is drawn outside the sidebar (position: fixed),
  // because the sidebar clips everything that sticks out of it.
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target as Node) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Sync sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarState');
    if (saved === 'collapsed') {
      setSidebarCollapsed(true);
    }

    // Enable smooth scrolling after hydration
    document.documentElement.style.scrollBehavior = 'smooth';

    // Default sidebar to collapsed for profile and CV pages
    if (pathname.startsWith('/profile') || pathname.startsWith('/cv')) {
      setSidebarCollapsed(true);
    }

    const handleResize = () => {
      const isMobileView = window.innerWidth <= 1000 || window.innerHeight < 500 || (window.innerWidth / window.innerHeight) <= 1;
      if (!isMobileView) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Clean up on unmount
      document.documentElement.style.scrollBehavior = '';
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/profile') || pathname.startsWith('/cv')) {
      setSidebarCollapsed(true);
    }
  }, [pathname]);

  const showTip = (label: string) => (event: React.SyntheticEvent<HTMLElement>) => {
    if (!sidebarCollapsed) return;
    const item = event.currentTarget.getBoundingClientRect();
    const bar = event.currentTarget.closest('nav')?.getBoundingClientRect();
    setTip({ label, top: item.top + item.height / 2, left: (bar?.right ?? item.right) + 8 });
  };
  const hideTip = () => setTip(null);

  const handleSidebarToggle = () => {
    const nextState = !sidebarCollapsed;
    setTip(null);
    setSidebarCollapsed(nextState);
    localStorage.setItem('sidebarState', nextState ? 'collapsed' : 'expanded');
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const currentYear = new Date().getFullYear();

  // Icons for the theme toggles (the small ones sit inside the switch, the larger ones on the sidebar button).
  const SUN_ICON = <Icon name="sun" size={10} />;
  const MOON_ICON = <Icon name="moon" size={10} />;
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  // Check if current item should highlight
  const isActive = (itemPath: string) => {
    return pathname === itemPath;
  };

  const isFullscreen = false;

  return (
    <>
      {!isFullscreen && <div className="bg-glow2"></div>}

      {/* ══════════════════════════════════════════
           SIDEBAR (desktop)
           ══════════════════════════════════════════ */}
      {!isFullscreen && (
        <nav className={`sb ${sidebarCollapsed ? 'col' : ''}`} id="sb">
          <div className="sbh">
            <div className="sbb">
              <div className="lm">
                <Link href="/" scroll={false}>
                  {club.name}<span>.</span>
                </Link>
              </div>
              <div className="ls">
                <Link href="/" scroll={false} className="pcs">
                  // {club.subtitle}
                </Link>
              </div>
            </div>
            <button className="sbt" id="sbt" title="Toggle sidebar" aria-label="Toggle sidebar" onClick={handleSidebarToggle}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M8.5 10.5L4.5 6.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <ul className="nis">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.path}
                className={`ni ${isActive(item.path) ? 'active' : ''}`}
                onMouseEnter={showTip(item.name)}
                onMouseLeave={hideTip}
                onFocus={showTip(item.name)}
                onBlur={hideTip}
              >
                <Link href={item.path} scroll={false} aria-current={isActive(item.path) ? 'page' : undefined} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', width: '100%', height: '100%' }}>
                  <span className="nic"><Icon name={item.icon} size={18} /></span>
                  <span className="nil">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sb-theme">
            <button
              type="button"
              className="sb-theme-btn"
              id="theme-toggle"
              onClick={toggleTheme}
              aria-label={themeLabel}
              onMouseEnter={showTip(themeLabel)}
              onMouseLeave={hideTip}
              onFocus={showTip(themeLabel)}
              onBlur={hideTip}
            >
              <span className="nic sb-theme-ic"><Icon name={theme === 'dark' ? 'moon' : 'sun'} size={18} /></span>
              <span className="nil">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              <span className="theme-switch sb-theme-switch" aria-hidden="true">
                <span className="switch-thumb">{theme === 'dark' ? MOON_ICON : SUN_ICON}</span>
              </span>
            </button>
          </div>

          <div className="sbf">
            <div className="sbfd"></div>
            <div className="sbfi">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '.4rem' }}>
                <div className="st" style={{ marginBottom: 0 }}><span className="std"></span>Active · <span id="current-year">{currentYear}</span></div>
              </div>
              <p>{club.department}<br />{club.university}</p>
            </div>
          </div>
        </nav>
      )}

      {!isFullscreen && tip && sidebarCollapsed && (
        <div className="sb-tip" role="tooltip" style={{ top: tip.top, left: tip.left }}>
          {tip.label}
        </div>
      )}

      {/* ══════════════════════════════════════════
           MOBILE TOP NAV
           ══════════════════════════════════════════ */}
      <nav ref={mobileNavRef} className={`tn ${isFullscreen ? 'force-tn' : ''}`}>
        <div className="lm">
          <Link href="/" scroll={false}>
            {club.name}<span style={{ color: 'var(--ac)' }}>.</span>
          </Link>
        </div>
        <div className="tn-right">
          <button className="tn-theme-toggle" id="theme-toggle-mob" title="Toggle theme" onClick={toggleTheme}>
            <div className="theme-switch">
              <div className="switch-thumb">
                {theme === 'dark' ? MOON_ICON : SUN_ICON}
              </div>
            </div>
          </button>
          <button type="button" className={`hbg ${mobileMenuOpen ? 'open' : ''}`} id="hbg" aria-label="Toggle menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div ref={mobileMenuRef} className={`mm ${mobileMenuOpen ? 'open' : ''} ${isFullscreen ? 'force-mm' : ''}`} id="mm">
        {NAV_ITEMS.map((item) => (
          <div key={item.path} className={`mi ${isActive(item.path) ? 'active' : ''}`}>
            <Link href={item.path} scroll={false} onClick={handleMobileLinkClick} aria-current={isActive(item.path) ? 'page' : undefined} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span className="mi-icon"><Icon name={item.icon} size={18} /></span>&nbsp;&nbsp;{item.name}
            </Link>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
           MAIN CONTENT
           ══════════════════════════════════════════ */}
      <main className={isFullscreen ? 'fs-main' : `ct ${sidebarCollapsed ? 'col' : ''}`} id="ct">
        {children}
        <footer className="sf">
          <div className="sf-brand">
            <span className="sf-mark">{club.name}<span>.</span></span>
            <span className="sf-sub">{club.subtitle}</span>
          </div>
          <p className="sf-addr">{club.department}, {club.university}</p>
          <div className="sf-meta">
            <a href={`mailto:${club.email}`}>{club.email}</a>
            <span>© {currentYear} {club.full_name}</span>
          </div>
        </footer>
      </main>
    </>
  );
}

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  return (
    <ThemeProvider>
      <LayoutContext.Provider value={{ isFullscreen, setIsFullscreen }}>
        <InnerLayout>{children}</InnerLayout>
      </LayoutContext.Provider>
    </ThemeProvider>
  );
}
