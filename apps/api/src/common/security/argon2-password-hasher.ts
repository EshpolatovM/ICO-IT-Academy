import { Injectable } from '@nestjs/common';
import { hash, verify } from '@node-rs/argon2';

import type { PasswordHasher } from './password-hasher.interface.js';

/**
 * Argon2id (docs/02 §1). `@node-rs/argon2` standart algoritmi — Argon2id
 * (`Algorithm` const enum bo'lgani uchun `isolatedModules` da aniq ko'rsatilmaydi; testda tekshiriladi).
 * Parol siyosati bu yerda emas — `@lms/shared` dagi `passwordSchema` (DTO validatsiyasi).
 */
@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  hash(plainPassword: string): Promise<string> {
    return hash(plainPassword);
  }

  verify(passwordHash: string, plainPassword: string): Promise<boolean> {
    return verify(passwordHash, plainPassword);
  }
}
