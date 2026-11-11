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

/**
 * "Bekor qilingan" belgisi (tombstone): `parent_token:{id}:revoked`. Bekor qilishda qo'yiladi —
 * kesh o'qilganda u bor bo'lsa token bazaga qaramay rad etiladi va `:valid` keshi qayta yozilmaydi
 * (bekor qilish bilan parallel o'qish eski "valid" ni keshga qaytara olmaydi).
 * Muddati `:valid` keshinikidan kam bo'lmasligi shart: undan oldin yozilgan har qanday "valid" yozuv
 * tombstone'dan oldin tugaydi.
 */
export const PARENT_TOKEN_REVOKED_CACHE_SUFFIX = ':revoked';
export const PARENT_TOKEN_REVOKED_TOMBSTONE_TTL_SECONDS = PARENT_TOKEN_VALID_CACHE_TTL_SECONDS;
/** Tombstone qiymati (faqat kalit mavjudligi ahamiyatli). */
export const PARENT_TOKEN_REVOKED_MARKER = '1';
