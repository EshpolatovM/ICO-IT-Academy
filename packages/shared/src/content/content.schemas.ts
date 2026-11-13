import { z } from 'zod';

import { AT_LEAST_ONE_FIELD_MESSAGE, hasAnyField } from '../validation/schema-helpers.js';

import {
  contentDescriptionSchema,
  contentStatusSchema,
  contentTitleSchema,
  optionalTextSchema,
  uniqueIdsSchema,
} from './content-schema-helpers.js';
import {
  CHEST_TITLE_MAX_LENGTH,
  CONTENT_ICON_MAX_LENGTH,
  CONTENT_REORDER_MAX,
  LESSON_CONTENT_MAX_LENGTH,
  LESSON_EST_MINUTES_MAX,
  LESSON_TITLE_MAX_LENGTH,
  LESSON_VIDEO_URL_MAX_LENGTH,
  LESSON_VIDEO_URL_PROTOCOLS,
  PATH_SLUG_MAX_LENGTH,
  PATH_SLUG_PATTERN,
  PATH_TITLE_MAX_LENGTH,
  SECTION_TITLE_MAX_LENGTH,
  TOPIC_TITLE_MAX_LENGTH,
} from './content.constants.js';

/**
 * Ilm yo'li kontenti sxemalari (docs/12 §3, 3.2 §2.2). Hammasi `z.strictObject`: noma'lum maydon
 * (masalan PATCH'dagi `sectionId`/`topicId`, TL Q-2) — 400. PATCH — kamida bitta maydon.
 */

export const PATH_SLUG_MESSAGE =
  "Slug faqat kichik lotin harflari, raqamlar va '-' dan iborat bo'lishi kerak (masalan frontend-asoslari).";
export const VIDEO_URL_PROTOCOL_MESSAGE = 'Video havolasi faqat https:// bilan boshlanishi kerak.';
export const REWARD_RANGE_MESSAGE = "Eng kam qiymat eng ko'p qiymatdan katta bo'lmasligi kerak.";

const pathSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(PATH_SLUG_MAX_LENGTH)
  .regex(PATH_SLUG_PATTERN, PATH_SLUG_MESSAGE);

/** `https:` → `/^(https)$/` (zod `z.url` protokolni ikki nuqtasiz tekshiradi). */
const VIDEO_PROTOCOL_PATTERN = new RegExp(
  `^(${LESSON_VIDEO_URL_PROTOCOLS.map((protocol) => protocol.replace(':', '')).join('|')})$`,
);

const videoUrlSchema = z
  .url({ protocol: VIDEO_PROTOCOL_PATTERN, error: VIDEO_URL_PROTOCOL_MESSAGE })
  .max(LESSON_VIDEO_URL_MAX_LENGTH);
const estMinutesSchema = z.number().int().min(1).max(LESSON_EST_MINUTES_MAX);
const iconSchema = optionalTextSchema(CONTENT_ICON_MAX_LENGTH);

/** `POST /admin/paths`. `status` yozilmaydi — servis `DRAFT` qo'yadi. */
export const createPathSchema = z.strictObject({
  title: contentTitleSchema(PATH_TITLE_MAX_LENGTH),
  slug: pathSlugSchema,
  description: contentDescriptionSchema.optional(),
});

/** `PATCH /admin/paths/:id`: `status: PUBLISHED` — kaskadsiz nashr (R Q-8). */
export const updatePathSchema = z
  .strictObject({
    title: contentTitleSchema(PATH_TITLE_MAX_LENGTH).optional(),
    slug: pathSlugSchema.optional(),
    description: contentDescriptionSchema.nullish(),
    status: contentStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** `POST /admin/paths/:id/publish` (body ixtiyoriy; bo'sh — `cascade: false`, R Q-3). */
export const publishPathSchema = z
  .strictObject({ cascade: z.boolean().optional() })
  .optional()
  .transform((value) => ({ cascade: value?.cascade ?? false }));

/** `GET /admin/paths?status=` — bitta ixtiyoriy holat (R Q-6). */
export const adminPathsQuerySchema = z.strictObject({
  status: contentStatusSchema.optional(),
});

export const createSectionSchema = z.strictObject({
  title: contentTitleSchema(SECTION_TITLE_MAX_LENGTH),
  description: contentDescriptionSchema.optional(),
});

export const updateSectionSchema = z
  .strictObject({
    title: contentTitleSchema(SECTION_TITLE_MAX_LENGTH).optional(),
    description: contentDescriptionSchema.nullish(),
    status: contentStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

export const createTopicSchema = z.strictObject({
  title: contentTitleSchema(TOPIC_TITLE_MAX_LENGTH),
  description: contentDescriptionSchema.optional(),
  icon: iconSchema.optional(),
});

export const updateTopicSchema = z
  .strictObject({
    title: contentTitleSchema(TOPIC_TITLE_MAX_LENGTH).optional(),
    description: contentDescriptionSchema.nullish(),
    icon: iconSchema.nullish(),
    status: contentStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** Markdown xom saqlanadi (HTML tozalash — frontend renderer'da). */
const contentMdSchema = z.string().max(LESSON_CONTENT_MAX_LENGTH);

export const createLessonSchema = z.strictObject({
  title: contentTitleSchema(LESSON_TITLE_MAX_LENGTH),
  contentMd: contentMdSchema.optional(),
  videoUrl: videoUrlSchema.optional(),
  estMinutes: estMinutesSchema.optional(),
});

/** `videoUrl`/`estMinutes` uchun `null` — tozalash. */
export const updateLessonSchema = z
  .strictObject({
    title: contentTitleSchema(LESSON_TITLE_MAX_LENGTH).optional(),
    contentMd: contentMdSchema.optional(),
    videoUrl: videoUrlSchema.nullish(),
    estMinutes: estMinutesSchema.nullish(),
    status: contentStatusSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

const rewardRangeSchema = z
  .strictObject({ min: z.number().int().min(0), max: z.number().int().min(0) })
  .refine((range) => range.min <= range.max, { message: REWARD_RANGE_MESSAGE, path: ['max'] });

/** Sandiq mukofoti (docs/11:214, S-26 A): qat'iy qiymat — `min = max`. 3-modulda faqat saqlanadi. */
export const chestRewardSchema = z.strictObject({
  xp: rewardRangeSchema,
  coin: rewardRangeSchema,
});

export const createChestSchema = z.strictObject({
  title: contentTitleSchema(CHEST_TITLE_MAX_LENGTH),
  afterTopicId: z.uuid(),
  reward: chestRewardSchema,
});

export const updateChestSchema = z
  .strictObject({
    title: contentTitleSchema(CHEST_TITLE_MAX_LENGTH).optional(),
    afterTopicId: z.uuid().optional(),
    reward: chestRewardSchema.optional(),
  })
  .refine(hasAnyField, AT_LEAST_ONE_FIELD_MESSAGE);

/** Tartiblash (TL Q-3): parent'ning barcha bolalari, yangi tartibda. */
const reorderIdsSchema = uniqueIdsSchema(1, CONTENT_REORDER_MAX);
export const reorderSectionsSchema = z.strictObject({ sectionIds: reorderIdsSchema });
export const reorderTopicsSchema = z.strictObject({ topicIds: reorderIdsSchema });
export const reorderLessonsSchema = z.strictObject({ lessonIds: reorderIdsSchema });

export type CreatePathRequest = z.input<typeof createPathSchema>;
export type UpdatePathRequest = z.input<typeof updatePathSchema>;
export type PublishPathRequest = z.input<typeof publishPathSchema>;
export type AdminPathsQuery = z.input<typeof adminPathsQuerySchema>;
export type CreateSectionRequest = z.input<typeof createSectionSchema>;
export type UpdateSectionRequest = z.input<typeof updateSectionSchema>;
export type CreateTopicRequest = z.input<typeof createTopicSchema>;
export type UpdateTopicRequest = z.input<typeof updateTopicSchema>;
export type CreateLessonRequest = z.input<typeof createLessonSchema>;
export type UpdateLessonRequest = z.input<typeof updateLessonSchema>;
export type ChestReward = z.output<typeof chestRewardSchema>;
export type CreateChestRequest = z.input<typeof createChestSchema>;
export type UpdateChestRequest = z.input<typeof updateChestSchema>;
export type ReorderSectionsRequest = z.input<typeof reorderSectionsSchema>;
export type ReorderTopicsRequest = z.input<typeof reorderTopicsSchema>;
export type ReorderLessonsRequest = z.input<typeof reorderLessonsSchema>;
