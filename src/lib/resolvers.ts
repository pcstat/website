import { getDatabase, Member } from './data';

export async function resolveMemberNames(studentIds: string[]): Promise<string[]> {
  if (!studentIds || studentIds.length === 0) return [];

  const db = await getDatabase();
  const allMembers: Member[] = [];

  db.committees.forEach(committee => {
    allMembers.push(...committee.members);
  });

  return studentIds
    .map(id => allMembers.find(m => m.student_id === id)?.name)
    .filter(Boolean) as string[];
}

export async function resolveMemberNamesString(studentIds: string[]): Promise<string> {
  const names = await resolveMemberNames(studentIds);
  return names.length > 0 ? names.join(', ') : 'Unknown members';
}
