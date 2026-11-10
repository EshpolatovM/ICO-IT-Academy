import { z } from 'zod';

import {
  PARENT_EXCHANGE_MAX_TOKENS,
  PARENT_TOKEN_LABEL_MAX_LENGTH,
  PARENT_TOKEN_LENGTH,
  PARENT_TOKEN_PATTERN,
} from './parent-token.constants.js';

/** Xom ota-ona tokeni (havoladagi yoki qo'lda kiritilgan kod). */
export const parentTokenSchema = z
  .string()
  .trim()
  .length(PARENT_TOKEN_LENGTH)
  .regex(PARENT_TOKEN_PATTERN);

/**
 * `POST /auth/parent/exchange` (docs/12 §1, docs/02 §5.1). Body'siz (yoki `tokens` siz) so'rov —
 * `parent_tokens` cookie'dagi saqlangan tokenlar bilan sessiyani yangilash.
 * `merge: true` — yangi tokenlar cookie'dagilarga qo'shiladi ("Farzand qo'shish").
 * Noma'lum maydon — 400 (`z.strictObject`).
 */
export const parentExchangeSchema = z
  .strictObject({
    tokens: z.array(parentTokenSchema).min(1).max(PARENT_EXCHANGE_MAX_TOKENS).optional(),
    merge: z.boolean().default(false),
  })
  .prefault({});

/** `POST /students/:id/parent-tokens` (docs/12 §2): `{ "label": "Onasi" }`. */
export const createParentTokenSchema = z
  .strictObject({
    label: z.string().trim().min(1).max(PARENT_TOKEN_LABEL_MAX_LENGTH).nullish(),
  })
  .prefault({});

export type ParentExchangeRequest = z.input<typeof parentExchangeSchema>;
export type CreateParentTokenRequest = z.input<typeof createParentTokenSchema>;
