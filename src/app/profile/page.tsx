'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DefaultProfile } from './DefaultProfile';
import { DynamicProfile } from './DynamicProfile';
import styles from './DefaultProfile.module.css';
import {
  clientGetDatabase,
  clientGetProjects,
  clientGetAchievements,
  clientLoadProfile
} from '@/lib/clientData';
import { Member, Project, Achievement, ProfileData } from '@/lib/types';

type ProfileState = 
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { 
      type: 'dynamic'; 
      id: string;
      data: ProfileData;
      member: Member;
    }
  | { 
      type: 'default'; 
      id: string;
      member: Member;
      committeeLabel: string;
      currentCommitteeLabel: string;
      projects: Project[];
      publications: Project[];
      achievements: Achievement[];
      uniqueTags: string[];
    };

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [state, setState] = useState<ProfileState>({ type: 'loading' });

  useEffect(() => {
    if (!id) {
      setState({ type: 'error', message: 'No executive member ID provided.' });
      return;
    }

    const loadData = async () => {
      try {
        const db = await clientGetDatabase();
        
        let foundMember: Member | null = null;
        let committeeLabel = '';

        for (const committee of db.committees) {
          const m = committee.members.find(member => member.student_id === id);
          if (m) {
            foundMember = m;
            committeeLabel = committee.label;
            break;
          }
        }

        if (!foundMember) {
          setState({ type: 'error', message: 'Executive member profile not found.' });
          return;
        }

        const currentCommitteeLabel = db.committees.find(c => c.session === db.current_committee)?.label || '';

        // Check for dynamic profile link
        if (foundMember.profile_link) {
          try {
            const dynamicData = await clientLoadProfile<ProfileData>(foundMember.profile_link);
            setState({
              type: 'dynamic',
              id,
              data: dynamicData,
              member: foundMember
            });
            return; // Exit early!
          } catch (err) {
            console.warn(`Failed to load dynamic profile for ${foundMember.name} from "${foundMember.profile_link}". Falling back to default profile.`, err);
          }
        }

        // Load standard profile data (fallback or default case)
        // Load Projects
        const projectsData = await clientGetProjects();
        const memberProjects = (projectsData.projects || []).filter(p => p.members.includes(id));
        const projects = memberProjects.filter(p => p.status === 'active' || p.status === 'completed');
        const publications = memberProjects.filter(p => p.status === 'research' || p.status === 'publication');

        // Load Achievements
        const achievementsData = await clientGetAchievements();
        const achievements = (achievementsData.achievements || []).filter(a => a.members.includes(id));

        // Derived tags
        const allTags = [...projects, ...publications].flatMap(p => p.tags || []);
        const uniqueTags = Array.from(new Set(allTags)).slice(0, 12);

        setState({
          type: 'default',
          id,
          member: foundMember,
          committeeLabel,
          currentCommitteeLabel,
          projects,
          publications,
          achievements,
          uniqueTags
        });
      } catch (err) {
        console.error('Error loading profile data:', err);
        setState({ type: 'error', message: 'Failed to load profile details.' });
      }
    };

    loadData();
  }, [id]);

  if (state.type === 'loading') {
    return (
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>Profile...</span></h2>
          <p className="pd">Please wait while we retrieve the profile details.</p>
        </div>
      </section>
    );
  }

  if (state.type === 'error') {
    return (
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis" style={{ position: 'relative' }}>
          <h2 className="pt" style={{ color: '#f44' }}>Profile <span>Not Found</span></h2>
          <p className="pd">{state.message}</p>
        </div>
      </section>
    );
  }

  if (state.type === 'dynamic') {
    return <DynamicProfile id={state.id} data={state.data} member={state.member} />;
  }

  // default profile mode
  return (
    <DefaultProfile
      id={state.id}
      member={state.member}
      committeeLabel={state.committeeLabel}
      currentCommitteeLabel={state.currentCommitteeLabel}
      projects={state.projects}
      publications={state.publications}
      achievements={state.achievements}
      uniqueTags={state.uniqueTags}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <section className={`${styles.pageContainer} pg active`}>
        <div className="ph rv vis">
          <h2 className="pt">Loading <span>Profile...</span></h2>
        </div>
      </section>
    }>
      <ProfileContent />
    </Suspense>
  );
}
