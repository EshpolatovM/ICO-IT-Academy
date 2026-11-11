import { randomBytes } from 'node:crypto';

import { AesGcmCipher } from './aes-gcm-cipher.js';

const cipher = new AesGcmCipher(randomBytes(32));

describe('AesGcmCipher', () => {
  it("shifrlaydi va ochadi; matn shifrlangan qiymatda ko'rinmaydi; har safar boshqa IV", () => {
    const encrypted = cipher.encrypt('["maxfiy"]', 'ctx');

    expect(encrypted.startsWith('v1.')).toBe(true);
    expect(encrypted).not.toContain('maxfiy');
    expect(cipher.encrypt('["maxfiy"]', 'ctx')).not.toBe(encrypted);
    expect(cipher.decrypt(encrypted, 'ctx')).toBe('["maxfiy"]');
  });

  it("buzilgan qiymat — null (GCM autentifikatsiyasi o'tmaydi)", () => {
    const encrypted = cipher.encrypt('qiymat', 'ctx');
    const middle = Math.floor(encrypted.length / 2);
    const swapped = encrypted[middle] === 'A' ? 'B' : 'A';
    const tampered = `${encrypted.slice(0, middle)}${swapped}${encrypted.slice(middle + 1)}`;

    expect(cipher.decrypt(tampered, 'ctx')).toBeNull();
  });

  it('boshqa kontekst (AAD) yoki boshqa kalit — null', () => {
    const encrypted = cipher.encrypt('qiymat', 'ctx');

    expect(cipher.decrypt(encrypted, 'boshqa')).toBeNull();
    expect(new AesGcmCipher(randomBytes(32)).decrypt(encrypted, 'ctx')).toBeNull();
  });

  it.each(['', 'v1.', 'v2.abc', 'v1.qisqa', 'v1.a.b', 'oddiy-matn'])(
    "noto'g'ri format: '%s' — null",
    (value) => {
      expect(cipher.decrypt(value, 'ctx')).toBeNull();
    },
  );
});
