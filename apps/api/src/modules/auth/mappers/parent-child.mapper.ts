import type { ParentChild } from '@lms/shared';

interface ChildSource {
  studentId: string;
  firstName: string;
  lastName: string;
  groupName: string | null;
}

/**
 * Ota-ona panelidagi farzandlar (docs/12 §1). Bir farzandga bir nechta token bo'lishi mumkin —
 * takrorlanmaydi, tartib saqlanadi. `groupName` — studentning faol guruhi nomi (guruhsiz — `null`).
 */
export function toParentChildren(sources: readonly ChildSource[]): ParentChild[] {
  const children = new Map<string, ParentChild>();
  for (const { studentId, firstName, lastName, groupName } of sources) {
    if (!children.has(studentId)) {
      children.set(studentId, { studentId, firstName, lastName, groupName });
    }
  }
  return [...children.values()];
}
