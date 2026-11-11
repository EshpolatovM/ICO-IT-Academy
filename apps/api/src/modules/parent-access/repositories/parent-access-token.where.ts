/**
 * Faol token: bekor qilinmagan va muddati o'tmagan (docs/02 §5; `expires_at` ixtiyoriy, S-16).
 * `parent_access_tokens` so'rovlari `where` qismi (ota-ona va mentor repository'lari ishlatadi).
 * Prisma tipi import qilinmaydi (dependency-cruiser: Prisma faqat `*.repository.ts` da) — shakl
 * ishlatilgan joyda `Prisma.ParentAccessTokenWhereInput` sifatida tekshiriladi.
 */
export function activeWhere(now: Date) {
  return { revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] };
}
