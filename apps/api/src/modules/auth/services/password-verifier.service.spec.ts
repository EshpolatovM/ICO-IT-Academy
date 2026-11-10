import { PasswordVerifier } from './password-verifier.service.js';

function createVerifier() {
  const hasher = {
    hash: jest.fn().mockResolvedValue('dummy-hash'),
    verify: jest.fn().mockResolvedValue(true),
  };
  return { hasher, verifier: new PasswordVerifier(hasher) };
}

describe('PasswordVerifier', () => {
  it('hash bor — hasher natijasini qaytaradi', async () => {
    const { hasher, verifier } = createVerifier();

    expect(await verifier.verify('real-hash', 'Parol123')).toBe(true);
    expect(hasher.verify).toHaveBeenCalledWith('real-hash', 'Parol123');
  });

  it("foydalanuvchi yo'q — baribir soxta hash bilan tekshiradi (timing) va false qaytaradi", async () => {
    const { hasher, verifier } = createVerifier();

    expect(await verifier.verify(null, 'Parol123')).toBe(false);
    expect(await verifier.verify(null, 'Boshqa123')).toBe(false);

    expect(hasher.verify).toHaveBeenCalledWith('dummy-hash', 'Parol123');
    expect(hasher.verify).toHaveBeenCalledTimes(2);
    expect(hasher.hash).toHaveBeenCalledTimes(1);
  });
});
