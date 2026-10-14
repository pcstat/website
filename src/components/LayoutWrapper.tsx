'use client';

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

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

interface NavigationItem {
  name: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavigationItem[] = [
  { name: 'Home', path: '/', icon: '~/' },
  { name: 'Executives', path: '/exec', icon: '{}' },
  { name: 'Past Executives', path: '/alumni', icon: '[]' },
  { name: 'Projects & Publications', path: '/projects', icon: '⬡' },
  { name: 'Achievements', path: '/achievements', icon: '★' },
  // { name: 'Courses & Certificates', path: '/courses', icon: '◈' },
  { name: 'Events', path: '/events', icon: '›_' },
  { name: 'About / Contact', path: '/about', icon: '?' },
];

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  const handleSidebarToggle = () => {
    const nextState = !sidebarCollapsed;
    setSidebarCollapsed(nextState);
    localStorage.setItem('sidebarState', nextState ? 'collapsed' : 'expanded');
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const currentYear = new Date().getFullYear();

  // Emojis/SVG icons for theme toggler
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
                  Statistics<span>.</span>
                </Link>
              </div>
              <div className="ls">
                <Link href="/" scroll={false} className="pcs">
                  // Programming Club
                </Link>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div id="theme-toggle" style={{ cursor: 'pointer' }} title="Toggle Theme" onClick={toggleTheme}>
                <div className="theme-switch">
                  <div className="switch-thumb">
                    {theme === 'dark' ? MOON_ICON : SUN_ICON}
                  </div>
                </div>
              </div>
              <button className="sbt" id="sbt" title="Toggle sidebar" onClick={handleSidebarToggle}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M8.5 10.5L4.5 6.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <ul className="nis">
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className={`ni ${isActive(item.path) ? 'active' : ''}`} data-tip={item.name}>
                <Link href={item.path} scroll={false} style={{ display: 'flex', alignItems: 'center', gap: '.8rem', width: '100%', height: '100%' }}>
                  <span className="nic">{item.icon}</span>
                  <span className="nil">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sbf">
            <div className="sbfd"></div>
            <div className="sbfi">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '.4rem' }}>
                <div className="st" style={{ marginBottom: 0 }}><span className="std"></span>Active · <span id="current-year">{currentYear}</span></div>
              </div>
              <p>Department of Statistics<br />University of Chittagong</p>
            </div>
          </div>
        </nav>
      )}

      {/* ══════════════════════════════════════════
           MOBILE TOP NAV
           ══════════════════════════════════════════ */}
      <nav ref={mobileNavRef} className={`tn ${isFullscreen ? 'force-tn' : ''}`}>
        <div className="lm">
          <Link href="/" scroll={false}>
            Statistics<span style={{ color: 'var(--ac)' }}>.</span>
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
          <div className={`hbg ${mobileMenuOpen ? 'open' : ''}`} id="hbg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div ref={mobileMenuRef} className={`mm ${mobileMenuOpen ? 'open' : ''} ${isFullscreen ? 'force-mm' : ''}`} id="mm">
        {NAV_ITEMS.map((item) => (
          <div key={item.path} className={`mi ${isActive(item.path) ? 'active' : ''}`}>
            <Link href={item.path} scroll={false} onClick={handleMobileLinkClick} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <span className="mi-icon">{item.icon}</span>&nbsp;&nbsp;{item.name}
            </Link>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
           MAIN CONTENT
           ══════════════════════════════════════════ */}
      <main className={isFullscreen ? 'fs-main' : `ct ${sidebarCollapsed ? 'col' : ''}`} id="ct">
        {children}
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
