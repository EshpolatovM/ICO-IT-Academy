import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

/**
 * E2E testlar haqiqiy PostgreSQL va Redis bilan ishlaydi (ildizdagi `compose.yaml`; CI'da service
 * konteynerlar). Ildizdagi `.env` bo'lsa yuklanadi; muhitda berilgan qiymatlar ustidan yozilmaydi.
 * (`process.loadEnvFile` ishlatilmaydi: Jest sandbox'idagi `process.env` — nusxa.)
 */
const ROOT_ENV_FILE = path.resolve(__dirname, '..', '..', '..', '.env');

if (existsSync(ROOT_ENV_FILE)) {
  const fileEnv = parseEnv(readFileSync(ROOT_ENV_FILE, 'utf8'));
  for (const [key, value] of Object.entries(fileEnv)) {
    process.env[key] ??= value;
  }
}
process.env.LOG_LEVEL ??= 'silent';
// Dev'dagi kabi (Next rewrites lokal proksi): X-Forwarded-For faqat loopback'dan ishonchli.
process.env.TRUST_PROXY ??= 'loopback';
