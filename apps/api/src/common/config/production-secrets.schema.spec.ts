import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

import { validateEnv } from './env.schema.js';
import { findPlaceholderSecrets } from './production-secrets.schema.js';

const ENV_EXAMPLE = path.resolve(__dirname, '..', '..', '..', '..', '..', '.env.example');

const REAL_SECRETS = {
  DATABASE_URL: 'postgresql://lms:Kq8s-real-pass@db.internal:5432/lms?schema=public',
  REDIS_URL: 'redis://:Zr2-real-pass@cache.internal:6379/0',
  JWT_ACCESS_SECRET: 'j'.repeat(48),
  PARENT_TOKEN_PEPPER: 'p'.repeat(48),
  PARENT_COOKIE_KEY: Buffer.alloc(32, 9).toString('base64'),
};

/** `.env.example` + haqiqiy sirlar + production sozlamalari. */
const PRODUCTION_ENV = {
  ...parseEnv(readFileSync(ENV_EXAMPLE, 'utf8')),
  ...REAL_SECRETS,
  NODE_ENV: 'production',
  COOKIE_SECURE: 'true',
};

const SECRET_KEYS = Object.keys(REAL_SECRETS) as (keyof typeof REAL_SECRETS)[];

function exampleSecrets(): typeof REAL_SECRETS {
  const example = parseEnv(readFileSync(ENV_EXAMPLE, 'utf8'));
  return Object.fromEntries(
    SECRET_KEYS.map((key) => [key, example[key] ?? '']),
  ) as typeof REAL_SECRETS;
}

describe('Production sirlari (M5)', () => {
  it('.env.example dagi barcha namuna sirlar placeholder deb aniqlanadi', () => {
    expect(findPlaceholderSecrets(exampleSecrets()).sort()).toEqual([...SECRET_KEYS].sort());
  });

  it('haqiqiy sirlar bilan production env qabul qilinadi', () => {
    expect(findPlaceholderSecrets(REAL_SECRETS)).toEqual([]);
    expect(validateEnv(PRODUCTION_ENV).NODE_ENV).toBe('production');
  });

  it.each(SECRET_KEYS)("production'da %s namuna qiymati bilan — rad etiladi", (key) => {
    const env = { ...PRODUCTION_ENV, [key]: exampleSecrets()[key] };

    expect(() => validateEnv(env)).toThrow(new RegExp(key));
  });

  it("development'da namuna sirlar ruxsat etiladi", () => {
    const env = { ...PRODUCTION_ENV, ...exampleSecrets(), NODE_ENV: 'development' };

    expect(validateEnv(env).NODE_ENV).toBe('development');
  });
});
