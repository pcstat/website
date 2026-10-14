'use client';

import React, { useState, useEffect } from 'react';
import type { Member } from '@/lib/types';
import Link from 'next/link';
import { MemberImage } from '@/app/profile/MemberImage';

const ICONS: Record<string, string> = {
  linkedin:   '🔗',
  github:     '⌥',
  facebook:   'ƒ',
  email:      '✉',
  codeforces: '◈',
};

export default function ExecList({ members, sessionLabel }: { members: Member[], sessionLabel: string }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Close modal on Escape key and cleanup body overflow on unmount
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

  const openMember = (m: Member) => {
    setSelectedMember(m);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = '';
  };

  return (
    <>
      <div className="egrid rv vis" id="exec-grid">
        {members.map((member) => (
          <div
            key={member.student_id}
            className={`ec ${member.highlight ? ' pres' : ''}`}
            data-m={member.student_id}
            onClick={() => openMember(member)}
          >
            <MemberImage
              src={member.icon_link || ''}
              alt={member.name}
              fallback={member.initial}
              className="eav"
            />
            <div className={member.highlight ? 'ei' : ''}>
                    <div className="erl">{member.role_display || `// ${member.role?.toUpperCase()}`}</div>
              <div className="enm">{member.name}</div>
              <div className="edp">{`Session ${member.session}`}</div>
              {member.highlight && member.bio && <div className="ebi">{member.bio}</div>}
            </div>
            <div className="vh">click to view profile ↗</div>
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
                  <div className="mrl" id="mrl">{selectedMember.role_display || `// ${selectedMember.role?.toUpperCase()}`}</div>
                  <div className="mnm" id="mnm">{selectedMember.name}</div>
                </div>
              </div>
              <div className="mbi" id="mbi">{selectedMember.bio}</div>
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
