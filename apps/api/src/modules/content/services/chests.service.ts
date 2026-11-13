import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, ContentConflictReason } from '@lms/shared';
import type { AdminChestNode } from '@lms/shared';

import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../../common/exceptions/constraint-violation.error.js';
import { ContentField } from '../content.constants.js';
import { contentConflictException, invalidFieldException, orNotFound } from '../content.errors.js';
import { toChestNode } from '../mappers/content.mapper.js';
import { PathChestsRepository } from '../repositories/path-chests.repository.js';
import { PathSectionsRepository } from '../repositories/path-sections.repository.js';
import { TopicsRepository } from '../repositories/topics.repository.js';

import { diffChanges, isEmptyDiff, sameReward } from './content-changes.js';
import { ContentKit } from './content-kit.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { ChestChanges, ChestRecord } from '../content.types.js';
import type { ContentEntity } from './content-auditor.service.js';
import type { CreateChestDto, UpdateChestDto } from '../dto/content.dto.js';

const chestEntity = (id: string): ContentEntity => ({ type: AuditEntityType.PATH_CHEST, id });

function chestExistsException(chestId: string) {
  return contentConflictException({ reason: ContentConflictReason.CHEST_EXISTS, chestId });
}

const topicNotInSectionException = () =>
  invalidFieldException(ContentField.AFTER_TOPIC_ID, "Mavzu shu bo'limda topilmadi");

function rewardAware(field: keyof ChestChanges, a: unknown, b: unknown): boolean {
  return field === 'reward'
    ? sameReward(a as ChestRecord['reward'], b as ChestRecord['reward'])
    : Object.is(a, b);
}

/**
 * Mukofot sandiqlari (docs/12 §3, TL Q-2): `afterTopicId` — shu sandiq bo'limidagi mavzu (aks holda
 * 400), bitta mavzudan keyin bitta sandiq (409 `CHEST_EXISTS`, poygada ham). `reward` faqat
 * saqlanadi — 3-modulda hech narsa berilmaydi.
 */
@Injectable()
export class ChestsService {
  constructor(
    private readonly chests: PathChestsRepository,
    private readonly sections: PathSectionsRepository,
    private readonly topics: TopicsRepository,
    private readonly kit: ContentKit,
  ) {}

  async create(
    sectionId: string,
    request: CreateChestDto,
    actor: ActorContext,
  ): Promise<AdminChestNode> {
    const id = await this.guardTopic(request.afterTopicId, () =>
      this.kit.transaction.commit(async () => {
        const section = orNotFound(await this.sections.lockRecord(sectionId));
        await this.requireFreeTopic(sectionId, request.afterTopicId);
        const created = await this.chests.createChest({
          sectionId,
          afterTopicId: request.afterTopicId,
          title: request.title,
          reward: request.reward,
        });
        await this.kit.auditor.record(AuditAction.CONTENT_CREATED, chestEntity(created.id), actor, {
          after: { title: request.title, parentId: sectionId },
        });
        return { result: created.id, changedPathIds: [section.pathId] };
      }),
    );
    return this.node(id);
  }

  async update(id: string, request: UpdateChestDto, actor: ActorContext): Promise<AdminChestNode> {
    await this.guardTopic(request.afterTopicId, () =>
      this.kit.transaction.commit(async () => {
        const current = await this.lockChest(id);
        const diff = diffChanges(current, request, rewardAware);
        if (isEmptyDiff(diff)) {
          return { result: undefined, changedPathIds: [] };
        }
        if (diff.afterTopicId !== undefined) {
          await this.requireFreeTopic(current.sectionId, diff.afterTopicId);
        }
        await this.chests.applyChanges(id, diff);
        await this.kit.auditor.recordPatch(chestEntity(id), actor, current, diff);
        return { result: undefined, changedPathIds: [current.pathId] };
      }),
    );
    return this.node(id);
  }

  async remove(id: string, actor: ActorContext): Promise<void> {
    await this.kit.transaction.commit(async () => {
      const current = await this.lockChest(id);
      await this.chests.deleteById(id);
      await this.kit.auditor.record(AuditAction.CONTENT_DELETED, chestEntity(id), actor, {
        before: { title: current.title, parentId: current.sectionId },
      });
      return { result: undefined, changedPathIds: [current.pathId] };
    });
  }

  private async node(id: string): Promise<AdminChestNode> {
    return toChestNode(orNotFound(await this.chests.findRecord(id)));
  }

  /**
   * Qulf tartibi ota → bola (bo'lim → sandiq; bo'limni o'chirish kaskadi bilan bir xil, deadlock
   * yo'q). Bo'lim yoki sandiq yo'q — 404.
   */
  private async lockChest(id: string): Promise<ChestRecord> {
    const { sectionId } = orNotFound(await this.chests.findRecord(id));
    orNotFound(await this.sections.lockRecord(sectionId));
    return orNotFound(await this.chests.lockRecord(id));
  }

  /**
   * Mavzu (qulflangan — parallel o'chirilmaydi) shu bo'limda (aks holda 400 `afterTopicId`) va undan
   * keyin sandiq yo'q (aks holda 409).
   */
  private async requireFreeTopic(sectionId: string, topicId: string): Promise<void> {
    const topic = await this.topics.lockRecord(topicId);
    if (topic?.parentId !== sectionId) {
      throw topicNotInSectionException();
    }
    const existing = await this.chests.findIdByAfterTopic(topicId);
    if (existing !== null) {
      throw chestExistsException(existing);
    }
  }

  /**
   * Poygadagi cheklov xatolari: `uq_path_chests_after_topic_id` — rollback'dan keyin mavjud sandiq
   * bilan 409; mavzu FK (mavzu o'chirilgan) — 400 `afterTopicId`.
   */
  private async guardTopic<T>(
    afterTopicId: string | undefined,
    action: () => Promise<T>,
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (afterTopicId === undefined) {
        throw error;
      }
      if (error instanceof ForeignKeyViolationError) {
        throw topicNotInSectionException();
      }
      const existing =
        error instanceof UniqueViolationError
          ? await this.chests.findIdByAfterTopic(afterTopicId)
          : null;
      throw existing === null ? error : chestExistsException(existing);
    }
  }
}
