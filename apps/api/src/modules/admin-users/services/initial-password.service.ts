import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_HASHER } from '../../../common/security/password-hasher.interface.js';
import { generateTemporaryPassword } from '../../../common/security/temporary-password.generator.js';

import type { PasswordHasher } from '../../../common/security/password-hasher.interface.js';

export interface GeneratedPassword {
  passwordHash: string;
  temporaryPassword: string;
}

export interface InitialPassword {
  passwordHash: string;
  /** Tizim yaratgan vaqtinchalik parol (javobda BIR MARTA); admin parol bergan bo'lsa — `null`. */
  temporaryPassword: string | null;
}

/**
 * Yangi akkaunt paroli (docs/02 §2, S-18): admin bergan parol yoki 10 belgili kriptografik
 * vaqtinchalik parol. Argon2 hash — tranzaksiyadan OLDIN (UnitOfWork ichida sekin ish yo'q).
 */
@Injectable()
export class InitialPasswordService {
  constructor(@Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher) {}

  async prepare(password: string | null | undefined): Promise<InitialPassword> {
    if (password) {
      return { passwordHash: await this.hasher.hash(password), temporaryPassword: null };
    }
    return this.generate();
  }

  /** Har doim tizim yaratgan vaqtinchalik parol (CSV import). */
  async generate(): Promise<GeneratedPassword> {
    const temporaryPassword = generateTemporaryPassword();
    return { passwordHash: await this.hasher.hash(temporaryPassword), temporaryPassword };
  }
}
