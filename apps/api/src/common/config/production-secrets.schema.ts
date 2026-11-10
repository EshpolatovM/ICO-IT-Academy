import type { z } from 'zod';

/**
 * `.env.example` dagi barcha namuna sirlari shu prefiks bilan boshlanadi (`change_me...`;
 * `PARENT_COOKIE_KEY` namunasi esa base64 ko'rinishida `change_me_...` satri). Production'da
 * bunday qiymat bilan ilova ishga tushmaydi (sir nusxa ko'chirilib unutilgan bo'lsa).
 */
export const PLACEHOLDER_SECRET_PREFIX = 'change_me';

/** To'g'ridan-to'g'ri sir qiymatlari. */
const PLAIN_SECRET_KEYS = ['JWT_ACCESS_SECRET', 'PARENT_TOKEN_PEPPER'] as const;
/** base64 ko'rinishidagi kalitlar (namunasi dekodlanganda prefiks bilan boshlanadi). */
const BASE64_SECRET_KEYS = ['PARENT_COOKIE_KEY'] as const;
/** Ichida parol bo'lishi mumkin bo'lgan ulanish manzillari. */
const URL_SECRET_KEYS = ['DATABASE_URL', 'REDIS_URL'] as const;

type SecretKey =
  | (typeof PLAIN_SECRET_KEYS)[number]
  | (typeof BASE64_SECRET_KEYS)[number]
  | (typeof URL_SECRET_KEYS)[number];

type SecretsEnv = Record<SecretKey, string> & { NODE_ENV: string };

function isPlaceholder(value: string): boolean {
  return value.toLowerCase().startsWith(PLACEHOLDER_SECRET_PREFIX);
}

function isPlaceholderBase64(value: string): boolean {
  return isPlaceholder(value) || isPlaceholder(Buffer.from(value, 'base64').toString('utf8'));
}

function isPlaceholderUrlPassword(value: string): boolean {
  try {
    return isPlaceholder(decodeURIComponent(new URL(value).password));
  } catch (_error) {
    return false;
  }
}

/** Namuna (placeholder) qiymatli sirlar ro'yxati. */
export function findPlaceholderSecrets(env: Record<SecretKey, string>): SecretKey[] {
  return [
    ...PLAIN_SECRET_KEYS.filter((key) => isPlaceholder(env[key])),
    ...BASE64_SECRET_KEYS.filter((key) => isPlaceholderBase64(env[key])),
    ...URL_SECRET_KEYS.filter((key) => isPlaceholderUrlPassword(env[key])),
  ];
}

/** Production'da `.env.example` dagi namuna sirlari (`change_me...`) rad etiladi. */
export function assertNoPlaceholderSecretsInProduction(
  env: SecretsEnv,
  ctx: z.RefinementCtx,
): void {
  if (env.NODE_ENV !== 'production') {
    return;
  }
  for (const key of findPlaceholderSecrets(env)) {
    ctx.addIssue({
      code: 'custom',
      path: [key],
      message: `production muhitida namuna qiymat ("${PLACEHOLDER_SECRET_PREFIX}...") ishlatilmaydi — haqiqiy sir bering`,
    });
  }
}
