/**
 * Ota-ona tokeni (docs/02 §5): `crypto.randomBytes(32)` → base64url, 43 belgi (256 bit).
 * Front ham shu qiymatlar bilan kiritilgan kodni tekshiradi (S-67: "kod" — tokenning o'zi).
 */
export const PARENT_TOKEN_LENGTH = 43;
export const PARENT_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;

/**
 * Ota-ona havolasi: `${WEB_BASE_URL}/parent#t=<token>` (docs/02 §4.4, S-70). Token URL fragmentida —
 * fragment serverga yuborilmaydi, shuning uchun proxy/access loglariga tushmaydi (docs/02 §5).
 * Eski `?t=` havolalari ham bir muddat qabul qilinadi (orqaga moslik, S-70).
 */
export const PARENT_LINK_PATH = '/parent';
export const PARENT_LINK_TOKEN_PARAM = 't';
/** `#t=` — havoladagi token oldidagi fragment qismi. */
export const PARENT_LINK_FRAGMENT_PREFIX = `#${PARENT_LINK_TOKEN_PARAM}=`;

/**
 * Bitta exchange so'rovidagi va `parent_tokens` cookie'sidagi tokenlar soni chegarasi.
 * Hujjatda raqam yo'q (Taxmin): ota-onaning farzandlari soni uchun yetarli, cookie hajmini cheklaydi.
 */
export const PARENT_EXCHANGE_MAX_TOKENS = 10;

/** `parent_access_tokens.label` (docs/11 §1: varchar(64)). */
export const PARENT_TOKEN_LABEL_MAX_LENGTH = 64;
