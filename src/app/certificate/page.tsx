'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { certificatesEnabled, findCertificate, RegistryUnreachableError } from '@/lib/certificates/client';
import { formatDateLong, normalizeId, type CertificateRecord } from '@/lib/certificates/core';
import { useSite } from '@/lib/site';

type Result =
  | { kind: 'idle' }
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'found'; cert: CertificateRecord }
  | { kind: 'missing' }
  | { kind: 'error' };

const OK = { color: '#0f0', background: 'rgba(0,255,0,0.1)', border: '1px solid #0f0' };
const BAD = { color: '#f44', background: 'rgba(255,68,68,0.1)', border: '1px solid #f44' };

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '0.25rem' }}>
      <strong>{label}:</strong> {children}
    </div>
  );
}

function ResultView({ result }: { result: Result }) {
  switch (result.kind) {
    case 'idle':
      return null;
    case 'empty':
      return <span style={{ color: 'var(--ac)' }}>// Please enter a Certificate ID.</span>;
    case 'loading':
      return <span style={{ color: 'var(--mut)' }}>// Verifying...</span>;
    case 'missing':
      return <span style={{ color: '#f44' }}>// Certificate not found.</span>;
    case 'error':
      return (
        <span style={{ color: 'var(--ac)' }}>
          // The certificate registry cannot be reached right now, so this ID could not be checked. That does not mean the certificate is invalid — please try again in a moment.
        </span>
      );
    case 'found': {
      const { cert } = result;
      const revoked = cert.status === 'revoked';
      const tone = revoked ? BAD : OK;
      return (
        <div style={{ color: 'var(--txt)', background: tone.background, border: tone.border, padding: '1rem', borderRadius: '8px', marginTop: '1rem', textAlign: 'left' }}>
          <div style={{ color: tone.color, fontWeight: 'bold', marginBottom: '0.5rem' }}>{revoked ? '✕ REVOKED — NO LONGER VALID' : '✓ VERIFIED AUTHENTIC'}</div>
          {revoked && (
            <div style={{ marginBottom: '0.75rem' }}>
              This certificate was withdrawn{cert.revoked_at ? ` on ${formatDateLong(cert.revoked_at)}` : ''}.
              {cert.revoked_reason ? ` Reason: ${cert.revoked_reason}` : ''}
            </div>
          )}
          <Line label="Recipient">{cert.recipient}</Line>
          <Line label="Awarded for">{cert.title}</Line>
          <Line label="Date">{formatDateLong(cert.date)}</Line>
          <Line label="Certificate ID">{cert.id}</Line>
          {!revoked && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,255,0,0.2)', paddingTop: '0.5rem', textAlign: 'center' }}>
              <Link href={`/certificate/view?id=${encodeURIComponent(cert.id)}`} className="bjoin" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                View Official Certificate ↗
              </Link>
            </div>
          )}
        </div>
      );
    }
  }
}

function VerifyForm() {
  const page = useSite().pages.certificate;
  const fromLink = useSearchParams().get('id') ?? '';
  const [certId, setCertId] = useState(fromLink);
  const [result, setResult] = useState<Result>({ kind: 'idle' });

  const verify = useCallback(async (raw: string) => {
    if (!normalizeId(raw)) {
      setResult({ kind: 'empty' });
      return;
    }
    setResult({ kind: 'loading' });
    try {
      const cert = await findCertificate(raw);
      if (cert) {
        setResult({ kind: 'found', cert });
        // Keep the ID in the address, so the verified result can be shared or printed as a link / QR code.
        window.history.replaceState(null, '', `?id=${encodeURIComponent(cert.id)}`);
      } else {
        // Whatever the reason (never issued, mistyped, wrong set) the answer is the same: not found.
        setResult({ kind: 'missing' });
      }
    } catch (err) {
      if (err instanceof RegistryUnreachableError) console.warn(err.message);
      else console.error('Verification error:', err);
      setResult({ kind: 'error' });
    }
  }, []);

  // A link such as /certificate?id=… (printed on the certificate, or shared) verifies by itself.
  useEffect(() => {
    if (fromLink) void verify(fromLink);
  }, [fromLink, verify]);

  const busy = result.kind === 'loading';

  return (
    <section className="pg active" id="page-certificate" style={{ display: 'block' }}>
      <div className="ph rv vis">
        <div className="pe">// {page.eyebrow}</div>
        <h2 className="pt">{page.title} <span>{page.accent}</span></h2>
        <p className="pd">{page.description}</p>
      </div>

      <div className="abc rv vis" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Verification Portal</h3>
        <p style={{ marginBottom: '2rem', fontSize: '1.1rem', color: 'var(--mut)' }}>Please enter the Certificate ID as it appears on the document to validate its authenticity. Capital letters, dashes and spaces do not matter.</p>
        {certificatesEnabled ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              id="cert-id-input"
              placeholder="e.g. SPC-PY26-7W34N"
              value={certId}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(e) => setCertId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void verify(certId); }}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--b)',
                color: 'var(--txt)',
                padding: '1rem 1.5rem',
                borderRadius: '8px',
                fontFamily: 'var(--fm)',
                maxWidth: '350px',
                width: '100%',
                fontSize: '1rem',
                transition: 'border-color .2s',
              }}
            />
            <button
              className="bjoin"
              id="verify-cert-btn"
              onClick={() => void verify(certId)}
              disabled={busy}
              style={{ border: 'none', cursor: 'pointer', padding: '1rem 2rem', fontSize: '1rem' }}
            >
              Verify Now →
            </button>
          </div>
        ) : (
          <p style={{ color: 'var(--mut)', fontFamily: 'var(--fm)' }}>// Certificate verification is not available yet.</p>
        )}
        <div id="cert-result" aria-live="polite" style={{ marginTop: '2rem', fontFamily: 'var(--fm)', fontSize: '1rem', minHeight: '1.5rem', fontWeight: 600 }}>
          <ResultView result={result} />
        </div>
      </div>
    </section>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
