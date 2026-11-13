/**
 * Student xaritasi keshi (docs/11 §16, 3.3 §6): `path:{studentId}` — string (json), TTL 10 daqiqa.
 * Konvert: `{ pathId, contentVersion, map }`.
 */
export const STUDENT_PATH_CACHE_KEY_PREFIX = 'path:';
const SECONDS_PER_MINUTE = 60;
const CACHE_TTL_MINUTES = 10;
export const STUDENT_PATH_CACHE_TTL_SECONDS = CACHE_TTL_MINUTES * SECONDS_PER_MINUTE;

/**
 * Kesh poygasidan himoya (mentor scope `:gen` naqshi): `path:{studentId}:gen`. Har invalidatsiyada
 * oshadi; yozish faqat o'qishdan oldingi qiymat o'zgarmagan bo'lsa. TTL keshnikidan uzun (1 kun).
 */
export const STUDENT_PATH_GENERATION_KEY_SUFFIX = ':gen';
const SECONDS_PER_DAY = 86_400;
export const STUDENT_PATH_GENERATION_TTL_SECONDS = SECONDS_PER_DAY;

/**
 * Yo'lning ko'rinadigan tuzilmasi (docs/13 §6): `content:path:{pathId}:v{version}` — barcha
 * studentlar uchun umumiy, TTL 10 daqiqa. Versiya oshganda eski kalit ishlatilmay qoladi.
 */
export const VISIBLE_PATH_KEY_PREFIX = 'content:path:';
export const VISIBLE_PATH_KEY_VERSION_SEPARATOR = ':v';
export const VISIBLE_PATH_CACHE_TTL_SECONDS = CACHE_TTL_MINUTES * SECONDS_PER_MINUTE;

/** Commit'dan keyingi invalidatsiya (B1): backoff bilan qayta urinish, oxirida `error` log. */
export const STUDENT_PATH_INVALIDATE_ATTEMPTS = 3;
export const STUDENT_PATH_INVALIDATE_BACKOFF_MS = 50;

/** `LOCKED` (403) javob matni (standart matn akkaunt bloki haqida). */
export const CONTENT_LOCKED_MESSAGE = 'Bu mavzu yoki dars hali ochilmagan';
