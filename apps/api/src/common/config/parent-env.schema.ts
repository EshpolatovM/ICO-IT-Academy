import { z } from 'zod';

/**
 * Ota-ona kirishi env o'zgaruvchilari (docs/02 §5, §5.1). Raqamlar kodga yozilmaydi.
 * S-16/S-17 qiymatlari (cookie 180 kun, 3 ta faol token) — `.env.example` da.
 * Faol tokenlar limiti 5-bosqichda `SettingsService` (admin sozlamalari) ga ko'chiriladi.
 */
const PEPPER_MIN_LENGTH = 32;
/** AES-256 kaliti: aynan 32 bayt (base64 ko'rinishida beriladi). */
const AES_256_KEY_BYTES = 32;

const positiveInt = z.coerce.number().int().positive();

function isBase64Key(value: string): boolean {
  const decoded = Buffer.from(value, 'base64');
  return decoded.length === AES_256_KEY_BYTES && decoded.toString('base64') === value;
}

export const parentEnvShape = {
  /** HMAC-SHA256 pepper: `token_hash = HMAC(pepper, token)`. Faqat `.env`/secret manager'da. */
  PARENT_TOKEN_PEPPER: z.string().min(PEPPER_MIN_LENGTH),
  /** `parent_tokens` cookie'sini shifrlash kaliti (AES-256-GCM): 32 bayt, base64. */
  PARENT_COOKIE_KEY: z
    .string()
    .refine(isBase64Key, `${AES_256_KEY_BYTES} baytli kalit base64 ko'rinishida bo'lishi kerak`),
  /** `ps` (parent session JWT) muddati — sliding. */
  PARENT_SESSION_TTL_SECONDS: positiveInt,
  /** `parent_tokens` cookie `Max-Age` (S-16). */
  PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS: positiveInt,
  /** Bitta studentdagi faol tokenlar soni chegarasi (S-17). */
  PARENT_MAX_ACTIVE_TOKENS: positiveInt,
  /** Exchange: IP bo'yicha urinishlar soni / oyna (docs/02 §5: 10 / 15 daqiqa). */
  PARENT_EXCHANGE_MAX_ATTEMPTS: positiveInt,
  PARENT_EXCHANGE_WINDOW_SECONDS: positiveInt,
  /** Exchange: shuncha muvaffaqiyatsiz urinishdan keyin IP bloklanadi (docs/02 §5: 20). */
  PARENT_EXCHANGE_MAX_FAILURES: positiveInt,
  /** Blok muddati (docs/02 §5: 1 soat); muvaffaqiyatsizliklar ham shu oynada sanaladi. */
  PARENT_EXCHANGE_BLOCK_SECONDS: positiveInt,
};
