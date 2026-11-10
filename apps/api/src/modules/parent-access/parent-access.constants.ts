/** Ota-ona tokeni entropiyasi (docs/02 §5): 32 bayt = 256 bit → base64url 43 belgi. */
export const PARENT_TOKEN_BYTES = 32;

/**
 * UI va loglar uchun token boshi (docs/02 §4.4: `prefix=raw[0..6]`, docs/12 §2 namunasi 6 belgi).
 * Ustun — varchar(8) (docs/11 §1).
 */
export const PARENT_TOKEN_PREFIX_LENGTH = 6;

/** Token faolligi keshi (docs/02 §5): `parent_token:{id}:valid` → student id. */
export const PARENT_TOKEN_VALID_CACHE_PREFIX = 'parent_token:';
export const PARENT_TOKEN_VALID_CACHE_SUFFIX = ':valid';
/**
 * Kesh muddati. Bekor qilishda kesh darhol o'chiriladi; TTL — boshqa yo'l bilan yaroqsiz bo'lish
 * holatlari (student deaktivatsiyasi, `expires_at`) uchun yuqori chegara.
 */
export const PARENT_TOKEN_VALID_CACHE_TTL_SECONDS = 300;
