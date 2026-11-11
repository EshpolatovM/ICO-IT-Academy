import { itemPath } from './request-path';

/** Admin guruhlar sahifalari yo'llari (docs/03 §4). */
export const AdminGroupsPath = {
  GROUPS: '/admin/groups',
  STUDENTS: '/admin/students',
} as const;

export function groupDetailPath(id: string): string {
  return itemPath(AdminGroupsPath.GROUPS, id);
}

/** A'zo jadvalidan student tafsilotiga havola. */
export function studentDetailHref(id: string): string {
  return itemPath(AdminGroupsPath.STUDENTS, id);
}
