/** So'rov identifikatori sarlavhasi: kiruvchi bo'lsa qayta ishlatiladi, javobga ham qo'yiladi. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Kiruvchi `x-request-id` faqat shu formatda qabul qilinadi (log injection'dan himoya). */
export const REQUEST_ID_PATTERN = /^[\w.:-]{1,128}$/;

/** Log yozuvidagi so'rov identifikatori kaliti (docs/13 §9). */
export const REQUEST_ID_LOG_KEY = 'requestId';

export const REDACT_CENSOR = '[Redacted]';

/**
 * Logga yozilmaydigan maydonlar (docs/13 §8: "loglarda token/parol yozilmaydi").
 * pino `redact` yo'llari: `*` — bitta daraja ixtiyoriy kalit.
 */
export const REDACT_PATHS: readonly string[] = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  ...['password', 'passwordHash', 'oldPassword', 'newPassword'].flatMap((key) => [key, `*.${key}`]),
  ...['token', 'tokens', 'accessToken', 'refreshToken'].flatMap((key) => [key, `*.${key}`]),
];
