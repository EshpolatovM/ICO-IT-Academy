import { Role, STUDENT_CODE_PREFIX } from '@lms/shared';

import type { ManagedRole, UserSearchTerm } from './admin-users.types.js';

/** `LIKE` maxsus belgilari (`%`, `_`, `\`) — foydalanuvchi satrida oddiy belgi sifatida. */
const LIKE_SPECIAL = /[\\%_]/g;
const STUDENT_CODE_FULL = new RegExp(`^${STUDENT_CODE_PREFIX}\\d+$`);
const DIGITS_ONLY = /^\d+$/;
/** Telefonga o'xshash satr: `+`, raqamlar va ajratgichlar. */
const PHONE_LIKE = /^\+?[\d\s\-()]+$/;
const NON_DIGIT = /\D/g;

function containsPattern(value: string): string {
  return `%${value.replace(LIKE_SPECIAL, (char) => `\\${char}`)}%`;
}

/** `ST-10245` yoki `10245` → `ST-10245` (aniq moslik — unique indeks bilan). */
function studentCodeOf(query: string): string | null {
  const upper = query.toUpperCase();
  if (STUDENT_CODE_FULL.test(upper)) {
    return upper;
  }
  return DIGITS_ONLY.test(query) ? `${STUDENT_CODE_PREFIX}${query}` : null;
}

function phonePatternOf(query: string): string | null {
  const digits = query.replace(NON_DIGIT, '');
  return PHONE_LIKE.test(query) && digits !== '' ? containsPattern(digits) : null;
}

/**
 * `?q=` → qidiruv sharti (docs/03 §4: "qidiruv (ID, ism)"): ism-familiya bo'yicha qism moslik
 * (pg_trgm), studentlarda — student kodi aniq mosligi, xodimlarda — telefon raqamlari bo'yicha.
 */
export function buildUserSearchTerm(
  query: string | undefined,
  role: ManagedRole,
): UserSearchTerm | null {
  if (query === undefined) {
    return null;
  }
  const isStudent = role === Role.STUDENT;
  return {
    namePattern: containsPattern(query.toLowerCase()),
    studentCode: isStudent ? studentCodeOf(query) : null,
    phonePattern: isStudent ? null : phonePatternOf(query),
  };
}
