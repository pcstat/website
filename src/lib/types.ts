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
  /** Number of club members. When set the home page says "MEMBERS"; when left out it counts the listed executives ("EXECUTIVES"). */
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
  home: string;
  site: string;
}

/** `home.json` — what the home page pins. */
export interface HomeConfig {
  /** `student_id`s of current-committee members shown in "Meet the team", in this order. */
  pinned_executives: string[];
  /** Project `id`s shown in "Top projects", in this order. */
  pinned_projects: string[];
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
  id: string;
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

/** `site.json` — everything that used to be hard-coded in the website: club details, sidebar, page texts, terminal. */
export interface SiteClub {
  /** Word before the dot of the logo (\"Statistics.\"). */
  name: string;
  /** Line under the logo, after \"// \". */
  subtitle: string;
  full_name: string;
  /** Year the club was founded; drives \"Est.\" and the Years counter. */
  founded: number;
  department: string;
  university: string;
  email: string;
  browser_title: string;
  description: string;
  share_description: string;
}

export interface SiteNavItem {
  path: string;
  label: string;
  icon: string;
}

export interface SiteHeading {
  eyebrow: string;
  title: string;
  /** The highlighted part of the heading, printed after `title`. */
  accent: string;
}

export interface SitePageHeading extends SiteHeading {
  description: string;
}

export interface SiteBlockHeading extends SiteHeading {
  link_label: string;
}

export interface SitePill {
  label: string;
  style: 'py' | 'rp' | 'ml' | 'st';
}

export type TerminalCommandName = 'about' | 'stats' | 'team' | 'projects' | 'achievements' | 'events' | 'alumni' | 'join';

export interface SiteConfig {
  club: SiteClub;
  nav: SiteNavItem[];
  home: {
    tag: string;
    title_lines: string[];
    description: string;
    pills: SitePill[];
    projects_block: SiteBlockHeading;
    team_block: SiteBlockHeading;
    join: SiteHeading & { text: string; button_label: string };
  };
  terminal: {
    title: string;
    tagline: string;
    motto: string;
    focus: string;
    join_text: string;
    commands: TerminalCommandName[];
  };
  pages: {
    exec: SitePageHeading;
    alumni: SitePageHeading;
    projects: SitePageHeading;
    achievements: SitePageHeading;
    events: SitePageHeading;
  };
  about: SiteHeading & {
    description: string;
    cards: { title: string; text: string; wide?: boolean }[];
    meetups: { label: string; title: string; detail: string }[];
    contact: { title: string; accent: string; text: string; button_label: string };
  };
}
