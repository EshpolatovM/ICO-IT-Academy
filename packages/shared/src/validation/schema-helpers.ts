import { z } from 'zod';

/** Umumiy sxema yordamchilari (users, groups va keyingi modullar uchun). */

export const AT_LEAST_ONE_FIELD_MESSAGE = "Kamida bitta maydon o'zgartirilishi kerak.";

/** PATCH so'rovida kamida bitta maydon berilganmi. */
export function hasAnyField(value: Record<string, unknown>): boolean {
  return Object.values(value).some((field) => field !== undefined);
}

/** Bo'sh satr — "berilmagan" (`?q=` formadan bo'sh kelishi mumkin). */
export const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? undefined : value));
