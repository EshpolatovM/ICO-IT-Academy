import { z } from 'zod';

import {
  contentStatusSchema,
  nullableTextSchema,
  optionalPositiveIntSchema,
  rewardRangeSchema,
  SLUG_FORMAT_MESSAGE,
  titleSchema,
  videoUrlSchema,
} from './content-fields.schemas';
import {
  CHEST_TITLE_MAX_LENGTH,
  CONTENT_ICON_MAX_LENGTH,
  CONTENT_TITLE_MAX_LENGTH,
  PATH_SLUG_MAX_LENGTH,
  PATH_SLUG_PATTERN,
} from './content.constants';

/*
 * Admin kontent formalari (yaratish va tahrirlash bitta sxemada; tahrirlashda `status` qo'shiladi).
 * TODO(3.2): @lms/shared ga ko'chiriladi (`createPathSchema`, `updateSectionSchema` ...).
 */

const contentTitle = titleSchema(CONTENT_TITLE_MAX_LENGTH);

export const pathFormSchema = z.strictObject({
  title: contentTitle,
  slug: z
    .string()
    .trim()
    .min(1)
    .max(PATH_SLUG_MAX_LENGTH)
    .regex(PATH_SLUG_PATTERN, SLUG_FORMAT_MESSAGE),
  description: nullableTextSchema(),
});

/**
 * Bo'lim va mavzu formasi (yaratish va tahrirlash). `icon` — faqat mavzuda ko'rinadi; `status` —
 * faqat tahrirlashda (yaratilgan har bir daraja `DRAFT`, §4.1).
 */
export const nodeFormSchema = z.strictObject({
  title: contentTitle,
  description: nullableTextSchema(),
  icon: nullableTextSchema(CONTENT_ICON_MAX_LENGTH),
  status: contentStatusSchema,
});

export const lessonCreateFormSchema = z.strictObject({ title: contentTitle });

/** Dars muharriri (`PATCH /admin/lessons/:id`): barcha maydonlar yuboriladi. */
export const lessonEditorFormSchema = z.strictObject({
  title: contentTitle,
  contentMd: z.string(),
  videoUrl: videoUrlSchema,
  estMinutes: optionalPositiveIntSchema,
  status: contentStatusSchema,
});

export const chestFormSchema = z.strictObject({
  title: titleSchema(CHEST_TITLE_MAX_LENGTH),
  afterTopicId: z.string().min(1, 'Mavzuni tanlang'),
  reward: z.strictObject({ xp: rewardRangeSchema, coin: rewardRangeSchema }),
});

export type PathFormInput = z.input<typeof pathFormSchema>;
export type PathFormValues = z.output<typeof pathFormSchema>;
export type NodeFormInput = z.input<typeof nodeFormSchema>;
export type NodeFormValues = z.output<typeof nodeFormSchema>;
export type LessonEditorInput = z.input<typeof lessonEditorFormSchema>;
export type LessonEditorValues = z.output<typeof lessonEditorFormSchema>;
export type ChestFormInput = z.input<typeof chestFormSchema>;
export type ChestFormValues = z.output<typeof chestFormSchema>;
