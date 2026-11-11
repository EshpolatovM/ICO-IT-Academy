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

/**
 * To'plam a'zoligi: kalit yo'q bo'lsa `-1` (kesh bo'sh), aks holda `SISMEMBER` natijasi (1/0).
 * KEYS[1], ARGV[1]=a'zo.
 */
export const SET_MEMBERSHIP_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 0 then
  return -1
end
return redis.call('SISMEMBER', KEYS[1], ARGV[1])`;

/** `unpack` bitta chaqiruvda Lua steki chegarasidan oshmasligi uchun `SADD` bo'laklari hajmi. */
const SADD_CHUNK_SIZE = 1000;

/**
 * Versiya tekshiruvli to'plam almashtirish (kesh poygasidan himoya): `KEYS[2]` (versiya hisoblagichi)
 * qiymati o'qishdan oldingi bilan bir xil bo'lsagina (`''` — kalit yo'q edi) `KEYS[1]` set'i
 * DEL + SADD + EXPIRE bilan almashtiriladi. ARGV[1]=kutilgan versiya, ARGV[2]=ttl, ARGV[3..]=a'zolar
 * (kamida bittasi). Yozilsa 1, versiya o'zgargan bo'lsa 0.
 */
export const REPLACE_SET_IF_VERSION_SCRIPT = `
local current = redis.call('GET', KEYS[2])
if (current or '') ~= ARGV[1] then
  return 0
end
redis.call('DEL', KEYS[1])
for i = 3, #ARGV, ${SADD_CHUNK_SIZE} do
  redis.call('SADD', KEYS[1], unpack(ARGV, i, math.min(i + ${SADD_CHUNK_SIZE - 1}, #ARGV)))
end
redis.call('EXPIRE', KEYS[1], ARGV[2])
return 1`;
