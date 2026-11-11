import type { AdminUserListItem, ManagedUserBase, MentorDetail, StudentDetail } from '@lms/shared';

import type { UserAccountRecord } from '../admin-users.types.js';

function toBase(record: UserAccountRecord): ManagedUserBase {
  return {
    id: record.id,
    firstName: record.firstName,
    lastName: record.lastName,
    status: record.status,
    mustChangePassword: record.mustChangePassword,
    lastLoginAt: record.lastLoginAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
  };
}

/** Xodimda telefon CHECK bilan majburiy (docs/11 §1), `null` bo'lishi mumkin emas. */
export function toAdminItem(record: UserAccountRecord): AdminUserListItem {
  return { ...toBase(record), phone: record.phone ?? '' };
}

export function toMentorItem(record: UserAccountRecord): MentorDetail {
  return { ...toAdminItem(record), bio: record.bio, groups: record.mentoredGroups };
}

/** Studentda kod CHECK bilan majburiy (docs/11 §1). */
export function toStudentItem(record: UserAccountRecord): StudentDetail {
  return { ...toBase(record), studentCode: record.studentCode ?? '', group: record.activeGroup };
}
