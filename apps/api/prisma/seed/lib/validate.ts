import { ScriptError } from './errors.js';

import type { z } from 'zod';

/** Qiymatni `@lms/shared` dagi zod sxema bilan tekshiradi; xato bo'lsa — tushunarli `ScriptError`. */
export function parseOrFail<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  label: string,
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const messages = [...new Set(result.error.issues.map((issue) => issue.message))].join(' ');
    throw new ScriptError(`${label}: ${messages}`);
  }
  return result.data;
}
