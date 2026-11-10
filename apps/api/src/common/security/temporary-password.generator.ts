import { randomInt } from 'node:crypto';

import { passwordSchema } from '@lms/shared';

/** Vaqtinchalik parol uzunligi (docs/02 §4.3: 10 belgi). */
export const TEMPORARY_PASSWORD_LENGTH = 10;

/** Aralashib ketadigan belgilarsiz (0/O, 1/l/I) — og'zaki yoki chatda aytish oson. */
const LETTERS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const ALPHABET = LETTERS + DIGITS;

function randomChar(source: string): string {
  return source.charAt(randomInt(source.length));
}

/** Fisher–Yates (kriptografik tasodif bilan). */
function shuffle(chars: string[]): string[] {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapWith = randomInt(index + 1);
    [chars[index], chars[swapWith]] = [chars[swapWith] ?? '', chars[index] ?? ''];
  }
  return chars;
}

function candidate(): string {
  const required = [randomChar(LETTERS), randomChar(DIGITS)];
  const rest = Array.from({ length: TEMPORARY_PASSWORD_LENGTH - required.length }, () =>
    randomChar(ALPHABET),
  );
  return shuffle([...required, ...rest]).join('');
}

/**
 * Kriptografik tasodifiy vaqtinchalik parol (docs/02 §4.3): kamida bitta harf va raqam bilan,
 * `passwordSchema` (qora ro'yxat ham) ga mos kelguncha qayta yaratiladi.
 */
export function generateTemporaryPassword(): string {
  let password = candidate();
  while (!passwordSchema.safeParse(password).success) {
    password = candidate();
  }
  return password;
}
