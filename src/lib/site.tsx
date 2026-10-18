'use client';

/**
 * `site.json` for client components. The root layout (a server component) loads it at build time and puts it in this
 * context; inside the admin panel's live preview a drafted `site.json` replaces it (see preview.ts).
 */
import React, { createContext, useContext } from 'react';
import { usePreview } from './preview';
import type { SiteConfig } from './types';

const SiteContext = createContext<SiteConfig | null>(null);

export function SiteProvider({ value, children }: { value: SiteConfig; children: React.ReactNode }) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteConfig {
  const preview = usePreview();
  const published = useContext(SiteContext);
  if (!published) throw new Error('useSite must be used inside <SiteProvider> (src/app/layout.tsx).');
  return preview?.site ?? published;
}
