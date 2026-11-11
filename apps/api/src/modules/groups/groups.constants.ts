/**
 * Mentor scope keshi (docs/01 §3.2, docs/11 §16, docs/13 §6): Redis set
 * `mentor:{mentorId}:studentIds`, TTL 60 s. Nom docs/01 va docs/11 dagidek (`studentIds`).
 */
export const MENTOR_SCOPE_CACHE_KEY_PREFIX = 'mentor:';
export const MENTOR_SCOPE_CACHE_KEY_SUFFIX = ':studentIds';
export const MENTOR_SCOPE_CACHE_TTL_SECONDS = 60;

/**
 * Kesh poygasidan himoya (generatsiya hisoblagichi): `mentor:{mentorId}:gen`. Har invalidatsiyada
 * oshadi; keshga yozish faqat DB o'qishidan oldingi qiymat o'zgarmagan bo'lsa bajariladi.
 * TTL keshnikidan ancha uzun (1 kun) — hisoblagich kesh yashayotganda yo'qolmasin.
 */
export const MENTOR_SCOPE_GENERATION_KEY_SUFFIX = ':gen';
const SECONDS_PER_DAY = 86_400;
export const MENTOR_SCOPE_GENERATION_TTL_SECONDS = SECONDS_PER_DAY;

/**
 * Commit'dan keyingi invalidatsiya (B1 siyosati): xato javobni yiqitmaydi — qisqa chiziqli backoff
 * bilan qayta urinadi (`attempt * BACKOFF_MS`), oxirida `error` log. Eng yomon holat — TTL (60 s).
 */
export const MENTOR_SCOPE_INVALIDATE_ATTEMPTS = 3;
export const MENTOR_SCOPE_INVALIDATE_BACKOFF_MS = 50;

/**
 * Bo'sh to'plamni ham keshlash uchun belgi (Redis bo'sh set saqlamaydi). UUID bo'la olmaydi,
 * shuning uchun hech qachon student id'si bilan mos kelmaydi.
 */
export const MENTOR_SCOPE_EMPTY_MARKER = '-';

/** Validatsiya xatolaridagi so'rov maydonlari nomlari (`details[].field`). */
export const GroupField = {
  PATH_ID: 'pathId',
  MENTOR_ID: 'mentorId',
  STUDENT_IDS: 'studentIds',
} as const;
