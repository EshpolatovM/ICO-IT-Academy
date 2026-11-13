import { Injectable } from '@nestjs/common';

import { AuditEntityType } from '@lms/shared';
import type { AdminLesson } from '@lms/shared';

import { orNotFound } from '../content.errors.js';
import { toAdminLesson } from '../mappers/content.mapper.js';
import { ProgressScope } from '../repositories/content-progress.repository.js';
import { LessonsRepository } from '../repositories/lessons.repository.js';

import { ContentKit } from './content-kit.service.js';
import { ContentNodeService } from './content-node.service.js';

import type { LessonChanges, LessonFields, LessonRecord } from '../content.types.js';
import type { CreateLessonDto } from '../dto/content.dto.js';

/**
 * Darslar (docs/12 §3): ota — mavzu (ko'chirish yo'q, TL Q-2). `contentMd` xom Markdown, bo'sh
 * qoralama — `''`; `videoUrl` faqat `https:` (sxemada). Javob — to'liq dars (`AdminLesson`).
 */
@Injectable()
export class LessonsService extends ContentNodeService<
  LessonRecord,
  CreateLessonDto,
  LessonFields,
  LessonChanges,
  AdminLesson
> {
  protected readonly entityType = AuditEntityType.LESSON;
  protected readonly progressScope = ProgressScope.LESSON;

  constructor(
    private readonly lessons: LessonsRepository,
    kit: ContentKit,
  ) {
    super(lessons, kit);
  }

  get(id: string): Promise<AdminLesson> {
    return this.loadNode(id);
  }

  protected async loadNode(id: string): Promise<AdminLesson> {
    return toAdminLesson(orNotFound(await this.lessons.findDetail(id)));
  }

  protected toFields(request: CreateLessonDto): LessonFields {
    return {
      title: request.title,
      contentMd: request.contentMd ?? '',
      videoUrl: request.videoUrl ?? null,
      estMinutes: request.estMinutes ?? null,
    };
  }
}
