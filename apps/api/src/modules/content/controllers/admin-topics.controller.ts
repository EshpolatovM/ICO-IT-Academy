import { Body, Controller, Delete, HttpCode, HttpStatus, Patch, Post, Put } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminLesson, AdminTopicNode, TopicSkillsResponse } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import {
  CreateLessonDto,
  ReorderLessonsDto,
  SetTopicSkillsDto,
  UpdateTopicDto,
} from '../dto/content.dto.js';
import { ContentOrderService, OrderLevel } from '../services/content-order.service.js';
import { LessonsService } from '../services/lessons.service.js';
import { TopicSkillsService } from '../services/topic-skills.service.js';
import { TopicsService } from '../services/topics.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Mavzular (docs/12 §3, 3.2 §2.1 #13, #14, #16, #18, #23) — SA A. */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/topics')
export class AdminTopicsController {
  constructor(
    private readonly topics: TopicsService,
    private readonly lessons: LessonsService,
    private readonly topicSkills: TopicSkillsService,
    private readonly order: ContentOrderService,
  ) {}

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateTopicDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminTopicNode> {
    return this.topics.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.topics.remove(id, actor);
  }

  @Post(':id/lessons')
  createLesson(
    @UuidParam('id') id: string,
    @Body() body: CreateLessonDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminLesson> {
    return this.lessons.create(id, body, actor);
  }

  @Put(':id/lessons/order')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorderLessons(
    @UuidParam('id') id: string,
    @Body() body: ReorderLessonsDto,
    @Actor() actor: ActorContext,
  ): Promise<void> {
    return this.order.reorder(OrderLevel.LESSONS, id, body.lessonIds, actor);
  }

  @Put(':id/skills')
  setSkills(
    @UuidParam('id') id: string,
    @Body() body: SetTopicSkillsDto,
    @Actor() actor: ActorContext,
  ): Promise<TopicSkillsResponse> {
    return this.topicSkills.set(id, body.skillIds, actor);
  }
}
