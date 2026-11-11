import commonPasswordsData from './common-passwords.json';

/**
 * Eng keng tarqalgan parollar qora ro'yxati (docs/02 §6, S-19; egasi qarori 1.6).
 * Manba va litsenziya (SecLists, MIT) — `common-passwords.json` ichida (`source`, `license`,
 * `licenseText`). Ro'yxatda faqat `passwordSchema` ning qolgan talablariga mos parollar bor:
 * qisqa yoki harf/raqamsiz parollar siyosatning o'zida rad etiladi, ularni saqlash ortiqcha.
 * Qiymatlar kichik harfda — tekshiruv katta-kichik harfga sezgir emas.
 */
const COMMON_PASSWORDS: ReadonlySet<string> = new Set(commonPasswordsData.passwords);

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}
