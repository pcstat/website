'use client';

import React, { useState, useEffect } from 'react';
import { Committee, Member } from '@/lib/data';
import Link from 'next/link';
import { MemberImage } from '@/app/profile/MemberImage';

const ICONS: Record<string, string> = {
  linkedin:   '🔗',
  github:     '⌥',
  facebook:   'ƒ',
  email:      '✉',
  codeforces: '◈',
};

export default function AlumniList({ committees }: { committees: Committee[] }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedSessionLabel, setSelectedSessionLabel] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, []);

  const openMember = (m: Member, sessionLabel: string) => {
    setSelectedMember(m);
    setSelectedSessionLabel(sessionLabel);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div id="alumni-content">
        {committees.map((committee) => (
          <div key={committee.session} className="ay rv vis">
            <div className="yl">{committee.label}</div>
            <div className="ar">
              {committee.members.map((m) => (
                <div
                  key={m.student_id}
                  className={`ac2 ${m.highlight ? 'featured' : ''}`}
                  data-m={m.student_id}
                  onClick={() => openMember(m, committee.label)}
                >
                  <div className="aav">{m.initial}</div>
                  <div>
                    <div className="anm">{m.name}</div>
                    <div className="arl">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Detail Modal Overlay */}
      {selectedMember && (
        <div className="ovl open" id="ov" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="mdl">
            <button className="mclose" id="mc" onClick={closeModal}>✕</button>
            <div className="mbody">
              <div className="mtop">
                <MemberImage
                  src={selectedMember.icon_link || ''}
                  alt={selectedMember.name}
                  fallback={selectedMember.initial}
                  className="mav"
                />
                <div>
                  <div className="mrl" id="mrl">{selectedMember.role_display || selectedMember.role}</div>
                  <div className="mnm" id="mnm">{selectedMember.name}</div>
                </div>
              </div>
              <div className="mbi" id="mbi">{selectedMember.bio || 'Alumni member of the Programming Club.'}</div>
              <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                <Link
                  href={`/profile?id=${selectedMember.student_id}`}
                  onClick={closeModal}
                  style={{
                    display: 'inline-block',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    background: 'var(--ac)',
                    color: 'var(--bg)',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  View Full Portfolio ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
