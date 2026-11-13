import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { AdminLesson } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { UpdateLessonDto } from '../dto/content.dto.js';
import { LessonsService } from '../services/lessons.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/** Darslar (docs/12 §3, 3.2 §2.1 #17) — SA A (mentorga dars matni yopiq, S-C1). */
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
@Controller('admin/lessons')
export class AdminLessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get(':id')
  get(@UuidParam('id') id: string): Promise<AdminLesson> {
    return this.lessons.get(id);
  }

  @Patch(':id')
  update(
    @UuidParam('id') id: string,
    @Body() body: UpdateLessonDto,
    @Actor() actor: ActorContext,
  ): Promise<AdminLesson> {
    return this.lessons.update(id, body, actor);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@UuidParam('id') id: string, @Actor() actor: ActorContext): Promise<void> {
    return this.lessons.remove(id, actor);
  }
}
