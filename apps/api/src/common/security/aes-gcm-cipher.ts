import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
/** GCM uchun tavsiya etilgan IV uzunligi (96 bit). */
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;
/** Format versiyasi — kalit/algoritm almashsa eski cookie'larni ajratib olish uchun. */
const FORMAT_VERSION = 'v1';
const SEPARATOR = '.';
const ENCODING = 'base64url';

/**
 * AES-256-GCM (autentifikatsiyalangan shifrlash): matn yashiriladi va o'zgartirilganini aniqlaydi.
 * Natija: `v1.<base64url(iv | tag | ciphertext)>`. `context` — AAD (masalan cookie nomi):
 * boshqa joy uchun shifrlangan qiymat bu yerda ochilmaydi.
 */
export class AesGcmCipher {
  constructor(private readonly key: Buffer) {}

  encrypt(plaintext: string, context: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv, { authTagLength: AUTH_TAG_BYTES });
    cipher.setAAD(Buffer.from(context));
    const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const payload = Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(ENCODING);
    return `${FORMAT_VERSION}${SEPARATOR}${payload}`;
  }

  /** Buzilgan, boshqa kalit/kontekst bilan shifrlangan yoki noto'g'ri formatdagi qiymat — `null`. */
  decrypt(value: string, context: string): string | null {
    const [version, payload, ...rest] = value.split(SEPARATOR);
    if (version !== FORMAT_VERSION || payload === undefined || rest.length > 0) {
      return null;
    }
    const raw = Buffer.from(payload, ENCODING);
    if (raw.length <= IV_BYTES + AUTH_TAG_BYTES) {
      return null;
    }
    try {
      const decipher = createDecipheriv(ALGORITHM, this.key, raw.subarray(0, IV_BYTES), {
        authTagLength: AUTH_TAG_BYTES,
      });
      decipher.setAAD(Buffer.from(context));
      decipher.setAuthTag(raw.subarray(IV_BYTES, IV_BYTES + AUTH_TAG_BYTES));
      const plaintext = decipher.update(raw.subarray(IV_BYTES + AUTH_TAG_BYTES));
      return Buffer.concat([plaintext, decipher.final()]).toString('utf8');
    } catch (_error) {
      return null;
    }
  }
}
