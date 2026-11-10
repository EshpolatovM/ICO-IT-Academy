import { z } from 'zod';

import { DEFAULT_API_PORT } from '../constants/app.constants.js';

/**
 * Ilova env o'zgaruvchilari sxemasi — yagona joy (docs/13 §4: barcha tashqi manzillar env orqali).
 * Yangi o'zgaruvchi qo'shilsa: shu sxema + `.env.example`.
 */
const MIN_PORT = 1;
const MAX_PORT = 65_535;

export const NODE_ENVS = ['development', 'test', 'production'] as const;
export const LOG_LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'] as const;

const POSTGRES_PROTOCOL = /^postgres(ql)?$/;
const REDIS_PROTOCOL = /^rediss?$/;

export const envSchema = z.object({
  NODE_ENV: z.enum(NODE_ENVS).default('development'),
  API_PORT: z.coerce.number().int().min(MIN_PORT).max(MAX_PORT).default(DEFAULT_API_PORT),
  DATABASE_URL: z.url({ protocol: POSTGRES_PROTOCOL }),
  REDIS_URL: z.url({ protocol: REDIS_PROTOCOL }),
  LOG_LEVEL: z.enum(LOG_LEVELS).default('info'),
});

export type Env = z.output<typeof envSchema>;

/** Env noto'g'ri bo'lganda ilova ishga tushmaydi — xabarda qaysi o'zgaruvchi va nima noto'g'riligi. */
export class EnvValidationError extends Error {
  override readonly name = 'EnvValidationError';
}

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new EnvValidationError(
      `Env o'zgaruvchilari noto'g'ri (.env.example ga qarang):\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
