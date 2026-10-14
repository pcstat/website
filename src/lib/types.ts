export interface SocialLink {
  type: string;
  label: string;
  url: string;
}

export interface Member {
  initial: string;
  role?: string;
  role_display?: string;
  name: string;
  session: string;
  student_id: string;
  highlight?: boolean;
  bio?: string;
  icon_link?: string;
  socials: SocialLink[];
  profile_link?: string;
  cv_link?: string;
}

export interface Committee {
  session: string;
  label: string;
  total_members?: number;
  members: Member[];
}

export interface DatabaseSchema {
  current_committee: string;
  committees: Committee[];
}

/** `database.json` — the index published by the database repo. */
export interface DatabaseIndex {
  imageBase: string;
  executives: string;
  projects: string;
  events: string;
  courses: string;
  achievements: string;
  certificates: string;
}

export interface Achievement {
  title: string;
  event: string;
  category: string;
  year: string;
  tier: 'gold' | 'silver' | 'bronze' | 'special' | 'community';
  team_label: string;
  members: string[];
  featured?: boolean;
}

export interface TallyItem {
  value: string;
  label: string;
}

export interface AchievementsSchema {
  tally: TallyItem[];
  achievements: Achievement[];
}

export interface Project {
  title: string;
  description: string;
  status: 'active' | 'completed' | 'research' | 'publication';
  tags: string[];
  members: string[];
  year: string;
  link?: string;
  demo_link?: string;
  featured?: boolean;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  type: 'course' | 'certificate';
  year: string;
  link?: string;
  featured?: boolean;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  audience: string;
  type: 'upcoming' | 'workshop' | 'contest' | 'seminar' | 'other';
  register_link?: string;
  details_link?: string;
}

export interface EventsSchema {
  note: string;
  events: ClubEvent[];
}

export interface IssuedCertificate {
  id: string;
  recipient: string;
  course: string;
  course1?: string;
  course2?: string;
  date: string;
  status?: string;
  template?: string;
  reason?: string;
  reason2?: string;
  person1?: string;
  post1?: string;
  person2?: string;
  post2?: string;
  modules?: string;
  hours?: string;
  score?: string;
  grade?: string;
}

export interface CertificatesSchema {
  issued_certificates: IssuedCertificate[];
}

export interface ProfileStat {
  value: string;
  label: string;
}

export interface ProfileSkillGroup {
  category: string;
  icon?: string;
  items: string[];
}

export interface ProfileTimelineItem {
  role: string;
  start: string;
  end: string;
  description?: string;
  short_desc?: string;
  company?: string;
  type?: string;
  tags?: string[];
}

export interface ProfileProject {
  title: string;
  description: string;
  tags?: string[];
  featured?: boolean;
  links?: {
    github?: string;
    demo?: string;
    paper?: string;
    [key: string]: string | undefined;
  };
}

export interface ProfilePublication {
  title: string;
  venue: string;
  tags?: string[];
  featured?: boolean;
  links?: {
    paper?: string;
    [key: string]: string | undefined;
  };
}

export interface ProfileAchievement {
  title: string;
  event: string;
  year: string;
}

export interface ProfileData {
  name: string;
  tagline?: string;
  role?: string;
  subtitle?: string;
  photo?: string;
  bio?: string;
  location?: string;
  email?: string;
  github?: string;
  session?: string;
  socials?: SocialLink[];
  stats?: ProfileStat[];
  focus_areas?: string[];
  skills?: ProfileSkillGroup[];
  timeline?: ProfileTimelineItem[];
  projects?: ProfileProject[];
  publications?: ProfilePublication[];
  achievements?: ProfileAchievement[];
  cv_link?: string;
}
