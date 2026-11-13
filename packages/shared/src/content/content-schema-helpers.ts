import { z } from 'zod';

import { ContentStatus } from '../enums/content-status.js';

import { PATH_DESCRIPTION_MAX_LENGTH } from './content.constants.js';

/** Kontent sxemalarining umumiy qismlari (3.2 §2.5: bitta joyda — jscpd). */

export const DUPLICATE_IDS_MESSAGE = "Ro'yxatda takrorlangan id bor.";

export const contentStatusSchema = z.enum(ContentStatus);

/** Sarlavha/nom: bo'shliqlar olib tashlanadi, 1…`max` belgi. */
export const contentTitleSchema = (max: number) => z.string().trim().min(1).max(max);

/** Ixtiyoriy qisqa satr (ikonka): bo'sh satr — `null`. */
export const optionalTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value));

/** Tavsif (`text`): bo'sh satr — `null`. */
export const contentDescriptionSchema = optionalTextSchema(PATH_DESCRIPTION_MAX_LENGTH);

/** Takrorsiz UUID ro'yxati (`min`…`max` ta). */
export const uniqueIdsSchema = (min: number, max: number) =>
  z
    .array(z.uuid())
    .min(min)
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, DUPLICATE_IDS_MESSAGE);
