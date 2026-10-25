'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CertificateViewer from './CertificateViewer';
import { findCertificate, loadTemplate, RegistryUnreachableError } from '@/lib/certificates/client';
import { formatDateLong, renderTemplate, templateValues, type CertificateRecord } from '@/lib/certificates/core';

/**
 * The page of ONE certificate — what a recipient shares. Its address is /certificate/view?id=<ID>, and the short
 * form /c/<ID> (public/_redirects) leads here too, so a certificate can go on a CV, in an e-mail or in a QR code.
 * Nothing is generated per certificate: the page looks the ID up in its set file when it is opened.
 */
type State =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'revoked'; cert: CertificateRecord }
  | { kind: 'ready'; cert: CertificateRecord; svgContent: string };

function ShareBar({ certId }: { certId: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window === 'undefined' ? '' : `${window.location.origin}/c/${encodeURIComponent(certId)}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', link);
    }
  }
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.25rem', fontFamily: 'var(--fm)', fontSize: '0.85rem' }}>
      <span style={{ color: 'var(--mut)' }}>Share this certificate:</span>
      <code style={{ padding: '0.35rem 0.6rem', border: '1px solid var(--b)', borderRadius: '6px', wordBreak: 'break-all' }}>{link}</code>
      <button className="bjoin" onClick={() => void copy()} style={{ border: 'none', cursor: 'pointer', padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
        {copied ? 'Copied ✓' : 'Copy link'}
      </button>
    </div>
  );
}

function CertificateContent() {
  const id = useSearchParams().get('id');
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!id) return { kind: 'error', message: 'No Certificate ID provided.' } as State;
      try {
        // 1. The ID names its set, so this downloads one set file and finds the certificate in it.
        const cert = await findCertificate(id);
        if (!cert) return { kind: 'error', message: 'Certificate not found.' } as State;
        if (cert.status === 'revoked') return { kind: 'revoked', cert } as State;
        // 2. The design, 3. filled in with escaped values.
        const svg = await loadTemplate(cert.template);
        return { kind: 'ready', cert, svgContent: renderTemplate(svg, templateValues(cert)) } as State;
      } catch (err) {
        if (err instanceof RegistryUnreachableError) {
          console.warn(err.message);
          return { kind: 'error', message: 'The certificate registry cannot be reached right now. That does not mean this certificate is invalid — please try again in a moment.' } as State;
        }
        console.error('Error loading certificate:', err);
        return { kind: 'error', message: 'This certificate could not be displayed. Please try again later.' } as State;
      }
    };
    void run().then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.kind === 'loading') {
    return (
      <section className="pg active" style={{ display: 'block' }}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>Certificate...</span></h2>
          <p className="pd">Please wait while we retrieve the verified document.</p>
        </div>
      </section>
    );
  }

  if (state.kind === 'error') {
    return (
      <section className="pg active" style={{ display: 'block' }}>
        <div className="ph rv vis">
          <h2 className="pt" style={{ color: '#f44' }}>Verification <span>Failed</span></h2>
          <p className="pd">{state.message}</p>
        </div>
        <div className="jcta rv vis" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link className="bjoin" href="/certificate">
            ← Back to Verification
          </Link>
        </div>
      </section>
    );
  }

  if (state.kind === 'revoked') {
    const { cert } = state;
    return (
      <section className="pg active" style={{ display: 'block' }}>
        <div className="ph rv vis">
          <h2 className="pt" style={{ color: '#f44' }}>Certificate <span>Revoked</span></h2>
          <p className="pd">
            Certificate {cert.id} ({cert.recipient} — {cert.title}) was withdrawn{cert.revoked_at ? ` on ${formatDateLong(cert.revoked_at)}` : ''} and is no longer valid.
            {cert.revoked_reason ? ` Reason: ${cert.revoked_reason}` : ''}
          </p>
        </div>
        <div className="jcta rv vis" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          <Link className="bjoin" href="/certificate">
            ← Back to Verification
          </Link>
        </div>
      </section>
    );
  }

  const { cert } = state;
  return (
    <section className="pg active" id="page-certificate-view" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// Document · ✓ Verified</div>
        <h2 className="pt">Official <span>Certificate</span></h2>
        <p className="pd">
          Verified digital record of achievement: {cert.recipient} — {cert.title}, {formatDateLong(cert.date)}. Issued by Statistics Programming Club.
        </p>
      </div>

      <CertificateViewer svgContent={state.svgContent} certId={cert.id} />
      <ShareBar certId={cert.id} />
    </section>
  );
}

export default function CertificateViewPage() {
  return (
    <Suspense fallback={
      <section className="pg active" style={{ display: 'block' }}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>Certificate...</span></h2>
        </div>
      </section>
    }>
      <CertificateContent />
    </Suspense>
  );
}
