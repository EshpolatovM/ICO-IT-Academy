import type {
  GroupMentorRef,
  GroupPathRef,
  GroupRef,
  GroupStatus,
  LearningPathListItem,
  UserStatus,
} from '@lms/shared';

/** Repository'dan chiqadigan yozuvlar (Prisma tiplari tashqariga chiqmaydi). */

export interface GroupRecord {
  id: string;
  name: string;
  status: GroupStatus;
  startsAt: Date | null;
  createdAt: Date;
  path: GroupPathRef;
  mentor: GroupMentorRef | null;
  /** Faol a'zolar soni. */
  membersCount: number;
}

export interface GroupMemberRecord {
  id: string;
  studentCode: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
  joinedAt: Date;
}

export interface GroupSearchCriteria {
  q?: string;
  status?: GroupStatus;
  mentorId?: string;
  pathId?: string;
  page: number;
  pageSize: number;
}

export interface GroupSearchPage {
  items: GroupRecord[];
  total: number;
}

export interface NewGroupData {
  name: string;
  pathId: string;
  mentorId: string | null;
  startsAt: Date | null;
}

/** PATCH o'zgarishlari (`startsAt: null` — sanani olib tashlash). */
export interface GroupChanges {
  name?: string;
  status?: GroupStatus;
  startsAt?: Date | null;
}

/** Studentning faol a'zoligi (409 tafsiloti uchun). */
export interface ActiveMembershipRecord {
  studentId: string;
  groupId: string;
}

/** `learning_paths` qisqa yozuvi — API elementi bilan bir xil shakl. */
export type LearningPathRecord = LearningPathListItem;

export interface MentorGroupRecord {
  id: string;
  name: string;
  status: GroupStatus;
  startsAt: Date | null;
  path: GroupPathRef;
  studentsCount: number;
}

export interface MentorStudentRecord {
  id: string;
  studentCode: string | null;
  firstName: string;
  lastName: string;
  status: UserStatus;
  lastLoginAt: Date | null;
}

export interface MentorStudentProfileRecord extends MentorStudentRecord {
  group: GroupRef | null;
  parentTokensCount: number;
}
