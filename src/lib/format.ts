import type { Member } from './types';

export const MEDAL_ICON: Record<string, string> = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  special: '🏆',
  community: '🎖️',
};

/**
 * Formats the executive's role based on their committee membership.
 * Adds "Former" if the member is not part of the current committee.
 */
export function formatExecutiveRole(member: Member, isCurrentCommittee: boolean): string {
  if (!member.role) return '';
  const prefix = isCurrentCommittee ? '' : 'Former ';
  const roleStr = member.role.toLowerCase().startsWith('club ') ? member.role : `Club ${member.role}`;
  return `${prefix}${roleStr}`;
}
