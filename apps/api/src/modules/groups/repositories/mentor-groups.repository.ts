import { Injectable } from '@nestjs/common';

import { GroupStatus, Role } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';
import { activeWhere as activeParentTokenWhere } from '../../parent-access/repositories/parent-access-token.where.js';

import {
  ACTIVE_GROUP_MEMBERSHIP_SELECT,
  ACTIVE_MEMBER_WHERE,
  MEMBER_ORDER_BY,
} from './group-members.repository.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type {
  MentorGroupRecord,
  MentorStudentProfileRecord,
  MentorStudentRecord,
} from '../groups.types.js';

const GROUP_SELECT = {
  id: true,
  name: true,
  status: true,
  startsAt: true,
  path: { select: { id: true, title: true } },
  _count: { select: { members: { where: ACTIVE_MEMBER_WHERE } } },
} as const satisfies Prisma.GroupSelect;

type GroupRow = Prisma.GroupGetPayload<{ select: typeof GROUP_SELECT }>;

const STUDENT_SELECT = {
  id: true,
  studentCode: true,
  firstName: true,
  lastName: true,
  status: true,
  lastLoginAt: true,
} as const satisfies Prisma.UserSelect;

/** Mentorning guruhi: o'ziniki, ACTIVE (o'chirilganlar extension orqali yashiriladi). */
function ownGroupWhere(mentorId: string): Prisma.GroupWhereInput {
  return { mentorId, status: GroupStatus.ACTIVE };
}

function toGroupRecord({ _count, ...row }: GroupRow): MentorGroupRecord {
  return { ...row, studentsCount: _count.members };
}

/**
 * Mentor sahifasi (docs/12 §12) uchun o'qish so'rovlari. Scope filtri so'rovning o'zida
 * (docs/01 §3.2 p.4): faqat mentorning ACTIVE guruhlari; studentga kirish — `@StudentScope` orqali.
 * `BaseRepository` dan meros olmaydi: faqat o'qish, bir nechta jadval bo'yicha.
 */
@Injectable()
export class MentorGroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listForMentor(mentorId: string): Promise<MentorGroupRecord[]> {
    const rows = await this.prisma.db.group.findMany({
      where: ownGroupWhere(mentorId),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: GROUP_SELECT,
    });
    return rows.map(toGroupRecord);
  }

  async findForMentor(id: string, mentorId: string): Promise<MentorGroupRecord | null> {
    const row = await this.prisma.db.group.findFirst({
      where: { id, ...ownGroupWhere(mentorId) },
      select: GROUP_SELECT,
    });
    return row ? toGroupRecord(row) : null;
  }

  /** Guruhning faol a'zolari (o'chirilmagan studentlar), familiya bo'yicha. */
  async listStudents(groupId: string): Promise<MentorStudentRecord[]> {
    const rows = await this.prisma.db.groupMember.findMany({
      where: { groupId, ...ACTIVE_MEMBER_WHERE },
      orderBy: [...MEMBER_ORDER_BY],
      select: { student: { select: STUDENT_SELECT } },
    });
    return rows.map((row) => row.student);
  }

  /** Student profili: faol guruhi va faol ota-ona tokenlari soni. */
  async findStudentProfile(id: string, now: Date): Promise<MentorStudentProfileRecord | null> {
    const row = await this.prisma.db.user.findFirst({
      where: { id, role: Role.STUDENT },
      select: {
        ...STUDENT_SELECT,
        groupMemberships: ACTIVE_GROUP_MEMBERSHIP_SELECT,
        _count: { select: { parentTokensAsStudent: { where: activeParentTokenWhere(now) } } },
      },
    });
    if (!row) {
      return null;
    }
    const { groupMemberships, _count, ...student } = row;
    return {
      ...student,
      group: groupMemberships[0]?.group ?? null,
      parentTokensCount: _count.parentTokensAsStudent,
    };
  }
}
