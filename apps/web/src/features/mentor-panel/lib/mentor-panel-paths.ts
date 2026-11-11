import { itemPath } from '@/lib/api';

/** Mentor paneli sahifalari yo'llari (docs/03 §3). */
export const MentorPanelPath = {
  GROUPS: '/mentor/groups',
  STUDENTS: '/mentor/students',
} as const;

/** `/mentor/groups/:id`. */
export function mentorGroupPath(id: string): string {
  return itemPath(MentorPanelPath.GROUPS, id);
}

/** `/mentor/students/:id`. */
export function mentorStudentPath(id: string): string {
  return itemPath(MentorPanelPath.STUDENTS, id);
}
