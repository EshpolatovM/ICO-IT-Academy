import type {
  AdminGroupDetail,
  AdminGroupListItem,
  AdminGroupMember,
  MentorGroupItem,
  MentorGroupStudent,
  MentorStudentProfile,
} from '@lms/shared';

import type {
  GroupMemberRecord,
  GroupRecord,
  MentorGroupRecord,
  MentorStudentProfileRecord,
  MentorStudentRecord,
} from '../groups.types.js';

/** `YYYY-MM-DD` uzunligi (ISO-8601 sanasi). */
const DATE_ONLY_LENGTH = 10;

/** `starts_at date` (UTC yarim tun) → `YYYY-MM-DD`. */
export function toDateOnly(date: Date | null): string | null {
  return date === null ? null : date.toISOString().slice(0, DATE_ONLY_LENGTH);
}

/** `YYYY-MM-DD` → `Date` (UTC yarim tun); `null` (olib tashlash) va `undefined` (berilmagan) saqlanadi. */
export function fromDateOnly(value: string | null | undefined): Date | null | undefined {
  return typeof value === 'string' ? new Date(`${value}T00:00:00.000Z`) : value;
}

export function toAdminGroupItem(record: GroupRecord): AdminGroupListItem {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    startsAt: toDateOnly(record.startsAt),
    createdAt: record.createdAt.toISOString(),
    path: record.path,
    mentor: record.mentor,
    membersCount: record.membersCount,
  };
}

/** Studentda kod CHECK bilan majburiy (docs/11 §1). */
function toAdminMember(record: GroupMemberRecord): AdminGroupMember {
  return {
    id: record.id,
    studentCode: record.studentCode ?? '',
    firstName: record.firstName,
    lastName: record.lastName,
    status: record.status,
    joinedAt: record.joinedAt.toISOString(),
  };
}

export function toAdminGroupDetail(
  record: GroupRecord,
  members: readonly GroupMemberRecord[],
): AdminGroupDetail {
  return { ...toAdminGroupItem(record), members: members.map(toAdminMember) };
}

export function toMentorGroupItem(record: MentorGroupRecord): MentorGroupItem {
  return {
    id: record.id,
    name: record.name,
    status: record.status,
    startsAt: toDateOnly(record.startsAt),
    path: record.path,
    studentsCount: record.studentsCount,
  };
}

export function toMentorStudent(record: MentorStudentRecord): MentorGroupStudent {
  return {
    id: record.id,
    studentCode: record.studentCode ?? '',
    firstName: record.firstName,
    lastName: record.lastName,
    status: record.status,
    lastLoginAt: record.lastLoginAt?.toISOString() ?? null,
  };
}

export function toMentorStudentProfile(record: MentorStudentProfileRecord): MentorStudentProfile {
  return {
    ...toMentorStudent(record),
    group: record.group,
    parentTokensCount: record.parentTokensCount,
  };
}
