/**
 * Atomar Redis amallari (Lua — server tomonida bitta buyruq sifatida bajariladi, poyga yo'q).
 * `EXPIRE ... NX` Redis 7+ talab qiladi (compose va CI: redis:7).
 */

/** `INCR` + faqat yangi kalitga TTL (oyna birinchi urinishdan boshlanadi). KEYS[1], ARGV[1]=ttl. */
export const INCREMENT_WITH_TTL_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
redis.call('EXPIRE', KEYS[1], ARGV[1], 'NX')
return hits`;

/**
 * Kalit bor va musbat bo'lsagina `DECR` (muddati o'tgan kalitni TTL'siz -1 qilib qayta yaratmaslik
 * uchun). Natija — yangi qiymat yoki 0. KEYS[1].
 */
export const DECREMENT_IF_POSITIVE_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]) or '0')
if current > 0 then
  return redis.call('DECR', KEYS[1])
end
return 0`;

/**
 * Compare-and-set: faqat kalit yo'q yoki undagi son kichikroq bo'lsa yoziladi (eski qiymat
 * yangisining ustidan yozilmaydi). KEYS[1], ARGV[1]=son, ARGV[2]=ttl. Yozilsa 1, aks holda 0.
 */
export const SET_IF_GREATER_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1]))
local incoming = tonumber(ARGV[1])
if current == nil or current < incoming then
  redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
  return 1
end
return 0`;

/**
 * `KEYS[2]` (masalan "bekor qilingan" belgisi) bo'lmasagina `KEYS[1]` ga yoziladi.
 * ARGV[1]=qiymat, ARGV[2]=ttl. Yozilsa 1, aks holda 0.
 */
export const SET_UNLESS_BLOCKED_SCRIPT = `
if redis.call('EXISTS', KEYS[2]) == 1 then
  return 0
end
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
return 1`;
