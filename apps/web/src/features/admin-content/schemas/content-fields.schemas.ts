import { z } from 'zod';

import { ContentStatus } from '@lms/shared';

import { SAFE_IMAGE_PROTOCOLS, toSafeUrl } from '@/lib/safeUrl';

import { LESSON_VIDEO_URL_MAX_LENGTH } from './content.constants';

/*
 * Kontent formalarining umumiy maydon sxemalari.
 * TODO(3.2): @lms/shared ga ko'chiriladi (`content.schemas.ts`).
 */

export const SLUG_FORMAT_MESSAGE =
  'Faqat kichik lotin harflari, raqamlar va chiziqcha (masalan: frontend-asoslari)';
export const VIDEO_URL_MESSAGE = "Faqat https:// bilan boshlanadigan to'liq havola";
export const REWARD_RANGE_MESSAGE = "Eng kami eng ko'pidan katta bo'lmasin";

/** Majburiy sarlavha: bo'sh joylar kesiladi, 1…max. */
export function titleSchema(max: number) {
  return z.string().trim().min(1).max(max);
}

/** Ixtiyoriy matn maydoni: bo'sh satr → `null` ("tozalash"). */
export function nullableTextSchema(max?: number) {
  const text = max === undefined ? z.string().trim() : z.string().trim().max(max);
  return text.transform((value) => (value === '' ? null : value));
}

export const contentStatusSchema = z.enum([
  ContentStatus.DRAFT,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED,
]);

/** Video havola: faqat `https:` (Q-10, `toSafeUrl`), bo'sh — `null`. */
export const videoUrlSchema = nullableTextSchema(LESSON_VIDEO_URL_MAX_LENGTH).refine(
  (value) => value === null || toSafeUrl(value, SAFE_IMAGE_PROTOCOLS) !== null,
  VIDEO_URL_MESSAGE,
);

/** Musbat butun son maydoni (matn input'dan): bo'sh — `null`. */
export const optionalPositiveIntSchema = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : Number(value)))
  .pipe(z.number().int().positive().nullable());

/** Mukofot qiymati: majburiy, butun, `≥ 0`. */
const rewardAmountSchema = z
  .string()
  .trim()
  .min(1)
  .transform(Number)
  .pipe(z.number().int().nonnegative());

/** `{ min, max }` — `min ≤ max` (xato `max` maydonida, §2.2). */
export const rewardRangeSchema = z
  .object({ min: rewardAmountSchema, max: rewardAmountSchema })
  .refine((range) => range.min <= range.max, { message: REWARD_RANGE_MESSAGE, path: ['max'] });
