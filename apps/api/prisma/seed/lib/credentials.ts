import { hash } from '@node-rs/argon2';

import { ScriptError } from './errors.js';

/**
 * Parol siyosati — docs/02-auth.md §6 (Taxmin → S-19): kamida 8 belgi, harf va raqam.
 */
const PASSWORD_MIN_LENGTH = 8;
const HAS_LETTER = /\p{L}/u;
const HAS_DIGIT = /\d/;

/** E.164: `+` va 8–15 raqam (docs/02 §1: `+998XXXXXXXXX`). */
const E164_PHONE = /^\+[1-9]\d{7,14}$/;
const PHONE_SEPARATORS = /[\s\-()]/g;

export function assertPasswordPolicy(password: string): void {
  const valid =
    password.length >= PASSWORD_MIN_LENGTH && HAS_LETTER.test(password) && HAS_DIGIT.test(password);
  if (!valid) {
    throw new ScriptError(
      `Parol kamida ${PASSWORD_MIN_LENGTH} belgidan iborat bo'lishi va harf hamda raqamni o'z ichiga olishi kerak.`,
    );
  }
}

/** Parolni Argon2id bilan hash qiladi (docs/02 §1). `@node-rs/argon2` standart parametrlari: Argon2id. */
export function hashPassword(password: string): Promise<string> {
  assertPasswordPolicy(password);
  return hash(password);
}

/** Telefonni saqlashdan oldin normalizatsiya qiladi (bo'shliq, `-`, qavslar olib tashlanadi) va E.164 ni tekshiradi. */
export function normalizePhone(rawPhone: string): string {
  const phone = rawPhone.replace(PHONE_SEPARATORS, '');
  if (!E164_PHONE.test(phone)) {
    throw new ScriptError(
      `Telefon raqam E.164 formatida bo'lishi kerak (masalan +998901234567): "${rawPhone}".`,
    );
  }
  return phone;
}
