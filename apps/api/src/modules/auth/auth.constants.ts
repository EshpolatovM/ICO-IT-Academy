import { API_GLOBAL_PREFIX } from '../../common/constants/app.constants.js';

/** Refresh token cookie (docs/12 §1: `rt=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`). */
export const REFRESH_COOKIE_NAME = 'rt';
export const REFRESH_COOKIE_PATH = `/${API_GLOBAL_PREFIX}/auth`;

/** Opaque refresh token entropiyasi: 32 bayt = 256 bit (base64url'da 43 belgi). */
export const REFRESH_TOKEN_BYTES = 32;

/** Access JWT algoritmi (simmetrik, bitta servis imzolaydi va tekshiradi). */
export const ACCESS_TOKEN_ALGORITHM = 'HS256';

/** `token_version` Redis keshi (docs/02 §3, docs/13 §6): `user:ver:{id}`. */
export const TOKEN_VERSION_CACHE_PREFIX = 'user:ver:';
/** Kesh muddati — barcha yozuvchilar keshni yangilaydi, TTL faqat xotirani tozalash uchun. */
export const TOKEN_VERSION_CACHE_TTL_SECONDS = 600;

/** Login rate limit hisoblagichi: `auth:login-fail:{kind}:{ip}:{login}` (docs/02 §6). */
export const LOGIN_FAILURE_KEY_PREFIX = 'auth:login-fail:';

/** Login xatosi — har doim bir xil (enumeration'dan himoya, docs/02 §6). */
export const INVALID_CREDENTIALS_MESSAGE = "Login yoki parol noto'g'ri";
export const WRONG_OLD_PASSWORD_MESSAGE = "Joriy parol noto'g'ri";

/** Topilmagan foydalanuvchi uchun soxta hash'ning tasodifiy paroli uzunligi (bayt). */
export const DUMMY_PASSWORD_BYTES = 32;

export const MS_PER_SECOND = 1000;

/**
 * Ota-ona sessiyasi (docs/02 §3, docs/12 §1): `ps` cookie — parent session JWT, butun API uchun.
 * `parent_tokens` — shifrlangan xom tokenlar, faqat `/api/v1/auth/parent` ga yuboriladi (docs/02 §5.1).
 */
export const PARENT_SESSION_COOKIE_NAME = 'ps';
export const PARENT_SESSION_COOKIE_PATH = `/${API_GLOBAL_PREFIX}`;
export const PARENT_TOKENS_COOKIE_NAME = 'parent_tokens';
export const PARENT_TOKENS_COOKIE_PATH = `/${API_GLOBAL_PREFIX}/auth/parent`;

/** Parent session JWT auditoriyasi — access token bilan almashtirib bo'lmasligi uchun. */
export const PARENT_SESSION_AUDIENCE = 'parent-session';

/**
 * Sliding session (docs/02 §3: 12 soat, sliding): qolgan muddat TTL ning shu ulushidan kam bo'lsa,
 * so'rov paytida `ps` yangilanadi (har so'rovda qayta imzolamaslik uchun).
 */
export const PARENT_SESSION_RENEW_REMAINING_RATIO = 0.5;

/** Exchange rate limit kalitlari (docs/02 §5): IP bo'yicha urinishlar va muvaffaqiyatsizliklar. */
export const PARENT_EXCHANGE_ATTEMPTS_KEY_PREFIX = 'auth:parent-exchange:attempts:';
export const PARENT_EXCHANGE_FAILURES_KEY_PREFIX = 'auth:parent-exchange:failures:';

/** Exchange xatosi — har doim bir xil (qaysi token yaroqsizligi oshkor qilinmaydi). */
export const INVALID_PARENT_TOKEN_MESSAGE = "Kirish kodi noto'g'ri yoki bekor qilingan";
