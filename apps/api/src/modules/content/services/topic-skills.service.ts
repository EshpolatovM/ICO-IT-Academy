import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType } from '@lms/shared';
import type { TopicSkillsResponse } from '@lms/shared';

import { ForeignKeyViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { ContentField } from '../content.constants.js';
import { invalidFieldException, invalidFieldsException, orNotFound } from '../content.errors.js';
import { SkillsRepository } from '../repositories/skills.repository.js';
import { TopicSkillsRepository } from '../repositories/topic-skills.repository.js';
import { TopicsRepository } from '../repositories/topics.repository.js';

import { ContentKit } from './content-kit.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  const set = new Set(a);
  return a.length === b.length && b.every((id) => set.has(id));
}

/**
 * Mavzu ko'nikmalari (`PUT /admin/topics/:id/skills`): to'plamni almashtirish (bo'sh — hammasini
 * olib tashlash), mavzu qulfi ostida. Noma'lum ko'nikma — 400 `skillIds.<i>`. O'zgarmasa — no-op.
 */
@Injectable()
export class TopicSkillsService {
  constructor(
    private readonly topics: TopicsRepository,
    private readonly skills: SkillsRepository,
    private readonly topicSkills: TopicSkillsRepository,
    private readonly kit: ContentKit,
  ) {}

  async set(
    topicId: string,
    skillIds: readonly string[],
    actor: ActorContext,
  ): Promise<TopicSkillsResponse> {
    await this.kit.transaction.commit(async () => {
      const topic = orNotFound(await this.topics.lockRecord(topicId));
      await this.requireSkills(skillIds);
      const before = await this.topicSkills.listSkillIds(topicId);
      if (sameSet(before, skillIds)) {
        return { result: undefined, changedPathIds: [] };
      }
      await this.replaceSkills(topicId, skillIds);
      await this.kit.auditor.record(
        AuditAction.TOPIC_SKILLS_SET,
        { type: AuditEntityType.TOPIC, id: topicId },
        actor,
        { before: { skillIds: before }, after: { skillIds: [...skillIds] } },
      );
      return { result: undefined, changedPathIds: [topic.pathId] };
    });
    return { skills: await this.topicSkills.listRefs(topicId) };
  }

  /** Ko'nikma poygada o'chirilgan (FK) — 400 `skillIds` (indeksi noma'lum). */
  private async replaceSkills(topicId: string, skillIds: readonly string[]): Promise<void> {
    try {
      await this.topicSkills.replace(topicId, skillIds);
    } catch (error) {
      throw error instanceof ForeignKeyViolationError
        ? invalidFieldException(ContentField.SKILL_IDS, "Ko'nikma topilmadi")
        : error;
    }
  }

  private async requireSkills(skillIds: readonly string[]): Promise<void> {
    const found = new Set(await this.skills.findExistingIds(skillIds));
    const missing = skillIds.flatMap((id, index) => (found.has(id) ? [] : [index]));
    if (missing.length > 0) {
      throw invalidFieldsException(
        missing.map((index) => ({
          field: `${ContentField.SKILL_IDS}.${String(index)}`,
          message: "Ko'nikma topilmadi",
        })),
      );
    }
  }
}
