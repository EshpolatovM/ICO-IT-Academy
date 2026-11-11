import { passwordSchema } from '@lms/shared';

import {
  generateTemporaryPassword,
  TEMPORARY_PASSWORD_LENGTH,
} from './temporary-password.generator.js';

describe('generateTemporaryPassword', () => {
  it('10 belgi, parol siyosatiga mos, har safar boshqa', () => {
    const passwords = Array.from({ length: 200 }, () => generateTemporaryPassword());

    for (const password of passwords) {
      expect(password).toHaveLength(TEMPORARY_PASSWORD_LENGTH);
      expect(passwordSchema.safeParse(password).success).toBe(true);
    }
    expect(new Set(passwords).size).toBe(passwords.length);
  });
});
