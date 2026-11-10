import { randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { PASSWORD_HASHER } from '../../../common/security/password-hasher.interface.js';
import { DUMMY_PASSWORD_BYTES } from '../auth.constants.js';

import type { PasswordHasher } from '../../../common/security/password-hasher.interface.js';

/**
 * Parolni tekshirish, vaqt bo'yicha bir xil: foydalanuvchi topilmasa ham soxta hash bilan
 * Argon2 tekshiruvi bajariladi — javob vaqtidan login mavjudligini bilib bo'lmaydi (docs/02 §6).
 */
@Injectable()
export class PasswordVerifier {
  private dummyHash: Promise<string> | undefined;

  constructor(@Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher) {}

  async verify(passwordHash: string | null, plainPassword: string): Promise<boolean> {
    if (passwordHash === null) {
      await this.hasher.verify(await this.getDummyHash(), plainPassword);
      return false;
    }
    return this.hasher.verify(passwordHash, plainPassword);
  }

  hash(plainPassword: string): Promise<string> {
    return this.hasher.hash(plainPassword);
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash(randomBytes(DUMMY_PASSWORD_BYTES).toString('base64url'));
    return this.dummyHash;
  }
}
