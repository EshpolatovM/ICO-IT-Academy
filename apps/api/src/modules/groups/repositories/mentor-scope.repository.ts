import { Injectable } from '@nestjs/common';

import { GroupStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/**
 * Mentor scope'i (docs/01 §3.1) uchun bitta so'rov: mentorning ACTIVE, o'chirilmagan guruhlaridagi
 * FAOL a'zolar (`left_at IS NULL`). Natija Redis set'ga keshlanadi (`MentorScopeCache`).
 * `BaseRepository` dan meros olmaydi: model CRUD emas, faqat scope so'rovi.
 */
@Injectable()
export class MentorScopeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStudentIds(mentorId: string): Promise<string[]> {
    const rows = await this.prisma.db.groupMember.findMany({
      where: {
        leftAt: null,
        student: { deletedAt: null },
        group: { mentorId, status: GroupStatus.ACTIVE, deletedAt: null },
      },
      select: { studentId: true },
    });
    return rows.map((row) => row.studentId);
  }
}
