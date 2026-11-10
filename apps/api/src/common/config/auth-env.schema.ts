import { z } from 'zod';

/**
 * Auth env o'zgaruvchilari (docs/02 §3, §6). Token muddatlari va limitlar kodga yozilmaydi —
 * faqat env'dan (S-12: qiymatlar `.env.example` da, egasi tasdiqlasa faqat qiymat o'zgaradi).
 * Hamma vaqt qiymatlari soniyalarda.
 */
const JWT_SECRET_MIN_LENGTH = 32;

const positiveSeconds = z.coerce.number().int().positive();
const positiveCount = z.coerce.number().int().positive();

export const authEnvShape = {
  /** Access JWT (HS256) imzo kaliti — faqat `.env`/secret manager'da. */
  JWT_ACCESS_SECRET: z.string().min(JWT_SECRET_MIN_LENGTH),
  JWT_ACCESS_TTL_SECONDS: positiveSeconds,
  REFRESH_TTL_STUDENT_SECONDS: positiveSeconds,
  REFRESH_TTL_STAFF_SECONDS: positiveSeconds,
  /** Refresh cookie `Secure` atributi. Production'da majburiy `true` (sxemada tekshiriladi). */
  COOKIE_SECURE: z.stringbool(),
  /**
   * Login rate limit (docs/02 §6): `ip + login` bo'yicha urinishlar. Har urinish parol tekshiruvidan
   * oldin sanaladi, muvaffaqiyatli kirishda hisoblagich tozalanadi.
   */
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: positiveCount,
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: positiveSeconds,
  /** IP bo'yicha umumiy login limiti (password spraying, Argon2 CPU DoS): muvaffaqiyatsiz urinishlar. */
  LOGIN_IP_RATE_LIMIT_MAX_ATTEMPTS: positiveCount,
  LOGIN_IP_RATE_LIMIT_WINDOW_SECONDS: positiveSeconds,
  /**
   * Refresh reuse grace oynasi: almashtirilgan token shu muddat ichida qayta kelsa (parallel tablar),
   * oila bekor qilinmaydi — 401 `REFRESH_SUPERSEDED`. Undan keyin — reuse detection (docs/02 §3).
   */
  REFRESH_REUSE_GRACE_SECONDS: positiveSeconds,
  /** `POST /auth/change-password`: foydalanuvchi bo'yicha eski parol urinishlari limiti. */
  CHANGE_PASSWORD_RATE_LIMIT_MAX_ATTEMPTS: positiveCount,
  CHANGE_PASSWORD_RATE_LIMIT_WINDOW_SECONDS: positiveSeconds,
};

/** Production'da cookie faqat HTTPS orqali yuborilishi shart. */
export function assertSecureCookieInProduction(
  env: { NODE_ENV: string; COOKIE_SECURE: boolean },
  ctx: z.RefinementCtx,
): void {
  if (env.NODE_ENV === 'production' && !env.COOKIE_SECURE) {
    ctx.addIssue({
      code: 'custom',
      path: ['COOKIE_SECURE'],
      message: "production muhitida COOKIE_SECURE=true bo'lishi shart",
    });
  }
}
