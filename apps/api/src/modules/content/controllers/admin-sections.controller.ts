import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, Post, Put } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminChestNode, AdminSectionNode, AdminTopicNode } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import {
  CreateChestDto,
  CreateTopicDto,
  ReorderTopicsDto,
  UpdateSectionDto,
} from '../dto/content.dto.js';
import { ChestsService } from '../services/chests.service.js';
import { ContentOrderService, OrderLevel } from '../services/content-order.service.js';
import { SectionsService } from '../services/sections.service.js';
import { TopicsService } from '../services/topics.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Bo'limlar (docs/12 §3, 3.2 §2.1 #9, #10, #12, #15, #19) — SA A. */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/sections')
export class AdminSectionsController {
  constructor(
    private readonly sections: SectionsService,
    private readonly topics: TopicsService,
    private readonly chests: ChestsService,
    private readonly order: ContentOrderService,
  ) {}

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateSectionDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminSectionNode> {
    return this.sections.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.sections.remove(id, actor);
  }

  @Post(':id/topics')
  createTopic(
    @UuidParam('id') id: string,
    @Body() body: CreateTopicDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminTopicNode> {
    return this.topics.create(id, body, actor);
  }

  @Put(':id/topics/order')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderTopics(
    @UuidParam('id') id: string,
    @Body() body: ReorderTopicsDto,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    return this.order.reorder(OrderLevel.TOPICS, id, body.topicIds, actor);
  }

  @Post(':id/chests')
  createChest(
    @UuidParam('id') id: string,
    @Body() body: CreateChestDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminChestNode> {
    return this.chests.create(id, body, actor);
  }
}
