import { Argon2PasswordHasher } from './argon2-password-hasher.js';

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('Argon2id hash yaratadi va tekshiradi', async () => {
    const passwordHash = await hasher.hash('Parol1234');

    expect(passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(passwordHash).not.toContain('Parol1234');
    expect(await hasher.verify(passwordHash, 'Parol1234')).toBe(true);
    expect(await hasher.verify(passwordHash, 'Boshqa1234')).toBe(false);
  });

  it('bir xil parol uchun har safar boshqa hash (salt)', async () => {
    expect(await hasher.hash('Parol1234')).not.toBe(await hasher.hash('Parol1234'));
  });
});
