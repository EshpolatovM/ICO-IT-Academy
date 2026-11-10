import type { ParentChild } from '@lms/shared';

interface ChildSource {
  studentId: string;
  firstName: string;
  lastName: string;
}

/**
 * Ota-ona panelidagi farzandlar (docs/12 §1). Bir farzandga bir nechta token bo'lishi mumkin —
 * takrorlanmaydi, tartib saqlanadi. `groupName` — guruhlar 2-bosqichda, hozircha `null`.
 */
export function toParentChildren(sources: readonly ChildSource[]): ParentChild[] {
  const children = new Map<string, ParentChild>();
  for (const { studentId, firstName, lastName } of sources) {
    if (!children.has(studentId)) {
      children.set(studentId, { studentId, firstName, lastName, groupName: null });
    }
  }
  return [...children.values()];
}
