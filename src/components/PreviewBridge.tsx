'use client';

import { useEffect } from 'react';
import { startPreviewBridge, usePreview } from '@/lib/preview';

/** Connects the page to the admin panel's live preview (see src/lib/preview.ts). Renders nothing normally. */
export default function PreviewBridge() {
  const preview = usePreview();
  useEffect(() => startPreviewBridge(), []);
  if (!preview) return null;
  return (
    <div
      style={{
        position: 'fixed', right: 12, bottom: 12, zIndex: 9999, padding: '6px 12px', borderRadius: 999,
        background: '#00d97e', color: '#04130b', fontFamily: 'var(--fm)', fontSize: 12, fontWeight: 700,
        boxShadow: '0 4px 14px rgba(0,0,0,.35)', pointerEvents: 'none',
      }}
    >
      LIVE PREVIEW · unsaved changes
    </div>
  );
}
