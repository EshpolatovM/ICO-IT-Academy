import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Role } from '@lms/shared';
import type {
  LessonCompleteResponse,
  LessonStartResponse,
  StudentLesson,
  StudentPathMap,
  StudentTopicDetail,
} from '@lms/shared';

import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { UuidParam } from '../../../common/decorators/uuid-param.decorator.js';
import { LessonCompletionService } from '../services/lesson-completion.service.js';
import { LessonStartService } from '../services/lesson-start.service.js';
import { StudentLessonService } from '../services/student-lesson.service.js';
import { StudentPathMapService } from '../services/student-path-map.service.js';
import { StudentTopicService } from '../services/student-topic.service.js';

import type { RequestUser } from '../../../common/auth/request-user.types.js';

/**
 * Student ilm yo'li (docs/12 §4, 3.3 §2.1) — faqat S. Scope — joriy foydalanuvchi (id faqat
 * tokendan); ko'rinmaydigan resurs — 404, qulflangan — 403 `LOCKED`. `chests/:id/open` — 5-modulda.
 */
@Roles(Role.STUDENT)
@Controller('student')
export class StudentPathController {
  constructor(
    private readonly map: StudentPathMapService,
    private readonly topics: StudentTopicService,
    private readonly lessons: StudentLessonService,
    private readonly starter: LessonStartService,
    private readonly completion: LessonCompletionService,
  ) {}

  @Get('path')
  getPath(@CurrentUser() user: RequestUser): Promise<StudentPathMap> {
    return this.map.get(user.id);
  }

  @Get('topics/:id')
  getTopic(
    @UuidParam('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<StudentTopicDetail> {
    return this.topics.get(user.id, id);
  }

  @Get('lessons/:id')
  getLesson(@UuidParam('id') id: string, @CurrentUser() user: RequestUser): Promise<StudentLesson> {
    return this.lessons.get(user.id, id);
  }

  @Post('lessons/:id/start')
  @HttpCode(HttpStatus.OK)
  start(
    @UuidParam('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<LessonStartResponse> {
    return this.starter.start(user.id, id);
  }

  @Post('lessons/:id/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @UuidParam('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<LessonCompleteResponse> {
    return this.completion.complete(user.id, id);
  }
}
