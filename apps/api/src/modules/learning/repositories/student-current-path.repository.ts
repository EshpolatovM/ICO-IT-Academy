import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/**
 * Studentning joriy yo'li (3.3 §4.1): faol a'zolik (`left_at IS NULL`) ⨝ o'chirilmagan guruh →
 * `path_id`, faqat yo'l `PUBLISHED` bo'lsa. Guruh `ARCHIVED` bo'lsa ham a'zolik faol (T-4).
 * Bitta indeksli so'rov (S-02: faol a'zolik bittadan ko'p emas).
 */
@Injectable()
export class StudentCurrentPathRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPublishedPathId(studentId: string): Promise<string | null> {
    const row = await this.prisma.client.groupMember.findFirst({
      where: {
        studentId,
        leftAt: null,
        group: { deletedAt: null, path: { status: ContentStatus.PUBLISHED } },
      },
      select: { group: { select: { pathId: true } } },
    });
    return row?.group.pathId ?? null;
  }
}
