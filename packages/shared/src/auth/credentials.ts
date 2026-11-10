import { z } from 'zod';

/**
 * Parol siyosati — docs/02-auth.md §6 (S-19 ✅): kamida 8 belgi, harf va raqam bo'lishi shart.
 * Qora ro'yxat (eng keng tarqalgan parollar) — docs/02 §6 da bor, lekin S-19 javobida yo'q va
 * ro'yxatning o'zi berilmagan: egasi qaroriga qadar qo'llanmaydi.
 */
export const PASSWORD_MIN_LENGTH = 8;
/** Kiritish chegarasi (DoS'dan himoya: Argon2'ga juda uzun satr yuborilmasin). Siyosat emas. */
export const PASSWORD_MAX_LENGTH = 128;

const HAS_LETTER = /\p{L}/u;
const HAS_DIGIT = /\d/;

export const PASSWORD_POLICY_MESSAGE = `Parol kamida ${PASSWORD_MIN_LENGTH} belgidan iborat bo'lishi va harf hamda raqamni o'z ichiga olishi kerak.`;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_POLICY_MESSAGE)
  .max(PASSWORD_MAX_LENGTH)
  .regex(HAS_LETTER, PASSWORD_POLICY_MESSAGE)
  .regex(HAS_DIGIT, PASSWORD_POLICY_MESSAGE);

/** E.164: `+` va 8–15 raqam (docs/02 §1: `+998XXXXXXXXX`). */
const E164_PHONE = /^\+[1-9]\d{7,14}$/;
/** Kiritishda ruxsat etilgan ajratgichlar — saqlashdan oldin olib tashlanadi. */
const PHONE_SEPARATORS = /[\s\-()]/g;

export const PHONE_FORMAT_MESSAGE =
  "Telefon raqam E.164 formatida bo'lishi kerak (masalan +998901234567).";

/** Telefon: bo'shliq, `-` va qavslar olib tashlanadi, so'ng E.164 tekshiriladi. Natija — normalizatsiya qilingan raqam. */
export const phoneSchema = z
  .string()
  .transform((raw) => raw.replace(PHONE_SEPARATORS, ''))
  .pipe(z.string().regex(E164_PHONE, PHONE_FORMAT_MESSAGE));

/** Student kodi prefiksi (docs/02 §2, S-18 ✅: `ST-` + ketma-ket raqam). */
export const STUDENT_CODE_PREFIX = 'ST-';

/** Sequence qiymatidan student kodini yasaydi: `10245` → `ST-10245`. */
export function formatStudentCode(sequenceValue: bigint | number): string {
  return `${STUDENT_CODE_PREFIX}${sequenceValue.toString()}`;
}
