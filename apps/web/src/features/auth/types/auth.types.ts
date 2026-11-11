/** Akkauntli rollar zonalari (docs/03 §0 layout'lari). Ota-ona zonasi alohida (`features/parent-access`). */
export type AccountZone = 'student' | 'mentor' | 'admin';

/** Route guard himoya qiladigan joy: rol zonasi, parolni almashtirish yoki faqat mehmonlar (login). */
export type GuardArea = AccountZone | 'change-password' | 'guest';

/**
 * Guard qarori: kutish (sessiya tiklanmoqda), ruxsat, boshqa sahifaga yo'naltirish yoki
 * `unavailable` (sessiyani vaqtinchalik xato tufayli tiklab bo'lmadi).
 */
export type GuardDecision =
  { type: 'wait' } | { type: 'allow' } | { type: 'unavailable' } | { type: 'redirect'; to: string };
