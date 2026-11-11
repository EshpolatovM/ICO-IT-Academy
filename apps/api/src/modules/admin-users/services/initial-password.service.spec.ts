import { passwordSchema } from '@lms/shared';

import { InitialPasswordService } from './initial-password.service.js';

import type { PasswordHasher } from '../../../common/security/password-hasher.interface.js';

describe('InitialPasswordService', () => {
  const hasher = { hash: jest.fn((plain: string) => Promise.resolve(`hash(${plain})`)) };
  const service = new InitialPasswordService(hasher as unknown as PasswordHasher);

  it("admin bergan parol: hash qilinadi, vaqtinchalik parol yo'q", async () => {
    await expect(service.prepare('Berilgan1x')).resolves.toEqual({
      passwordHash: 'hash(Berilgan1x)',
      temporaryPassword: null,
    });
  });

  it.each([null, undefined])(
    'parol %s — 10 belgili vaqtinchalik parol, siyosatga mos',
    async (value) => {
      const { passwordHash, temporaryPassword } = await service.prepare(value);

      expect(temporaryPassword).toHaveLength(10);
      expect(passwordSchema.safeParse(temporaryPassword).success).toBe(true);
      expect(passwordHash).toBe(`hash(${String(temporaryPassword)})`);
    },
  );

  it('generate har safar yangi parol beradi', async () => {
    const first = await service.generate();
    const second = await service.generate();

    expect(first.temporaryPassword).not.toBe(second.temporaryPassword);
  });
});
