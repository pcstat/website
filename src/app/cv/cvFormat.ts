/** Helpers shared by the CV page (screen) and the print layout. */

/** Database values such as "null /4.0" come from empty fields — never show them. */
export function usable(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v !== '' && !/^(null|undefined|n\/a|-)\b/i.test(v);
}

export type ContactKind = 'github' | 'email' | 'phone' | 'linkedin' | 'website';

export function linkFor(kind: ContactKind, value: string) {
  if (kind === 'email') return `mailto:${value}`;
  if (kind === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.includes('.')) return `https://${value}`;
  return kind === 'linkedin' ? `https://www.linkedin.com/in/${value}` : `https://github.com/${value}`;
}

/** A link as it reads on paper: no protocol, no trailing slash. */
export const shortUrl = (value: string) => value.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');

/** Keys of cv.json that are not sections (they form the header, or are drawn separately). */
export const CV_HEADER_KEYS = ['name', 'role', 'summary', 'location', 'phone', 'email', 'github', 'linkedin', 'website'];

/** Sections in the order a printed CV reads: education and experience first, personal extras last. */
const FIRST = ['education', 'experience', 'projects', 'technical_skills', 'publications', 'honors_and_awards'];
const LAST = ['certifications', 'languages'];

const TITLES: Record<string, string> = {
  technical_skills: 'Technical Skills',
  honors_and_awards: 'Honors & Awards',
  workshops_conducted: 'Workshops Conducted',
};

export function sectionTitle(key: string): string {
  return (
    TITLES[key] ??
    key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

/**
 * The list sections of a CV in print order. Known sections come first (education → experience → projects →
 * skills → publications → awards), any other section the member added follows in file order, and certifications
 * and languages close the page. Empty sections are left out.
 */
export function printSectionKeys(cv: Record<string, unknown>): string[] {
  const present = Object.keys(cv).filter((key) => !CV_HEADER_KEYS.includes(key) && Array.isArray(cv[key]) && (cv[key] as unknown[]).length > 0);
  const first = FIRST.filter((key) => present.includes(key));
  const last = LAST.filter((key) => present.includes(key));
  const middle = present.filter((key) => !FIRST.includes(key) && !LAST.includes(key));
  return [...first, ...middle, ...last];
}
