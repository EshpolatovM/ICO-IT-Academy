import {
  adminPathsQuerySchema,
  createChestSchema,
  createLessonSchema,
  createPathSchema,
  createSectionSchema,
  createSkillSchema,
  createTopicSchema,
  publishPathSchema,
  reorderLessonsSchema,
  reorderSectionsSchema,
  reorderTopicsSchema,
  setTopicSkillsSchema,
  skillsQuerySchema,
  updateChestSchema,
  updateLessonSchema,
  updatePathSchema,
  updateSectionSchema,
  updateSkillSchema,
  updateTopicSchema,
} from '@lms/shared';

import { createZodDto } from '../../../common/validation/zod-dto.js';

/** DTO'lar `@lms/shared` sxemalaridan (docs/12 §3, 3.2 §2.2). */
export class AdminPathsQueryDto extends createZodDto(adminPathsQuerySchema) {}
export class CreatePathDto extends createZodDto(createPathSchema) {}
export class UpdatePathDto extends createZodDto(updatePathSchema) {}
export class PublishPathDto extends createZodDto(publishPathSchema) {}
export class CreateSectionDto extends createZodDto(createSectionSchema) {}
export class UpdateSectionDto extends createZodDto(updateSectionSchema) {}
export class CreateTopicDto extends createZodDto(createTopicSchema) {}
export class UpdateTopicDto extends createZodDto(updateTopicSchema) {}
export class CreateLessonDto extends createZodDto(createLessonSchema) {}
export class UpdateLessonDto extends createZodDto(updateLessonSchema) {}
export class CreateChestDto extends createZodDto(createChestSchema) {}
export class UpdateChestDto extends createZodDto(updateChestSchema) {}
export class ReorderSectionsDto extends createZodDto(reorderSectionsSchema) {}
export class ReorderTopicsDto extends createZodDto(reorderTopicsSchema) {}
export class ReorderLessonsDto extends createZodDto(reorderLessonsSchema) {}
export class SkillsQueryDto extends createZodDto(skillsQuerySchema) {}
export class CreateSkillDto extends createZodDto(createSkillSchema) {}
export class UpdateSkillDto extends createZodDto(updateSkillSchema) {}
export class SetTopicSkillsDto extends createZodDto(setTopicSkillsSchema) {}
