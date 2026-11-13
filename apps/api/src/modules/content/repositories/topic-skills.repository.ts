import { Injectable } from '@nestjs/common';

import type { SkillRef } from '@lms/shared';

import { translateConstraintErrors } from '../../../infra/prisma/prisma-constraint.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/** `topic_skills` (docs/11 §3): mavzu ↔ ko'nikma. Chaqiruvchining tranzaksiyasida (mavzu qulfi). */
@Injectable()
export class TopicSkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listSkillIds(topicId: string): Promise<string[]> {
    const rows = await this.prisma.client.topicSkill.findMany({
      where: { topicId },
      orderBy: { skillId: 'asc' },
      select: { skillId: true },
    });
    return rows.map((row) => row.skillId);
  }

  /** Mavzu ko'nikmalari `name` bo'yicha. */
  async listRefs(topicId: string): Promise<SkillRef[]> {
    const rows = await this.prisma.client.topicSkill.findMany({
      where: { topicId },
      orderBy: { skill: { name: 'asc' } },
      select: { skill: { select: { id: true, name: true, icon: true } } },
    });
    return rows.map((row) => row.skill);
  }

  /**
   * To'plamni almashtiradi: eskilari o'chiriladi, yangilari yoziladi. Ko'nikma poygada o'chirilgan
   * bo'lsa (FK) — `ForeignKeyViolationError`.
   */
  async replace(topicId: string, skillIds: readonly string[]): Promise<void> {
    const client = this.prisma.client;
    await client.topicSkill.deleteMany({ where: { topicId } });
    await translateConstraintErrors(() =>
      client.topicSkill.createMany({ data: skillIds.map((skillId) => ({ topicId, skillId })) }),
    );
  }
}
