import { Injectable } from '@nestjs/common';

import { AuditEntityType, ContentConflictReason } from '@lms/shared';
import type { AdminTopicNode } from '@lms/shared';

import { contentConflictException } from '../content.errors.js';
import { ProgressScope } from '../repositories/content-progress.repository.js';
import { PathChestsRepository } from '../repositories/path-chests.repository.js';
import { TopicsRepository } from '../repositories/topics.repository.js';

import { ContentKit } from './content-kit.service.js';
import { ContentNodeService } from './content-node.service.js';
import { PathTreeService } from './path-tree.service.js';

import type { TopicChanges, TopicFields, TopicRecord } from '../content.types.js';
import type { CreateTopicDto } from '../dto/content.dto.js';

/**
 * Mavzular (docs/12 §3): ota — bo'lim (boshqa bo'limga ko'chirish yo'q, TL Q-2); javob — mavzu
 * tuguni (ko'nikmalar va darslar bilan). Sandiq bog'langan mavzu o'chirilmaydi — 409 `HAS_CHEST`.
 */
@Injectable()
export class TopicsService extends ContentNodeService<
  TopicRecord,
  CreateTopicDto,
  TopicFields,
  TopicChanges,
  AdminTopicNode
> {
  protected readonly entityType = AuditEntityType.TOPIC;
  protected readonly progressScope = ProgressScope.TOPIC;

  constructor(
    topics: TopicsRepository,
    kit: ContentKit,
    private readonly tree: PathTreeService,
    private readonly chests: PathChestsRepository,
  ) {
    super(topics, kit);
  }

  protected loadNode(id: string): Promise<AdminTopicNode> {
    return this.tree.topic(id);
  }

  protected toFields(request: CreateTopicDto): TopicFields {
    return {
      title: request.title,
      description: request.description ?? null,
      icon: request.icon ?? null,
    };
  }

  protected override async beforeDelete(record: TopicRecord): Promise<void> {
    const chestId = await this.chests.findIdByAfterTopic(record.id);
    if (chestId !== null) {
      throw contentConflictException({ reason: ContentConflictReason.HAS_CHEST, chestId });
    }
  }
}
