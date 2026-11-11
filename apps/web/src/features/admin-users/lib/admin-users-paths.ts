/** Admin foydalanuvchilar sahifalari yo'llari (docs/03 §4). */
export const AdminUsersPath = {
  STUDENTS: '/admin/students',
  STUDENT_IMPORT: '/admin/students/import',
  MENTORS: '/admin/mentors',
  ADMINS: '/admin/admins',
} as const;

export function studentDetailPath(id: string): string {
  return `${AdminUsersPath.STUDENTS}/${encodeURIComponent(id)}`;
}
