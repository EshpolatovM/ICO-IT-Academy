import { AppConfigService } from './app-config.service.js';
import { EnvValidationError, validateEnv } from './env.schema.js';

const VALID_ENV = {
  DATABASE_URL: 'postgresql://lms:secret@localhost:5433/lms?schema=public',
  REDIS_URL: 'redis://:secret@localhost:6379/0',
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  JWT_ACCESS_TTL_SECONDS: '900',
  REFRESH_TTL_STUDENT_SECONDS: '2592000',
  REFRESH_TTL_STAFF_SECONDS: '604800',
  COOKIE_SECURE: 'false',
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: '5',
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: '900',
};

const PARSED_AUTH_ENV = {
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  JWT_ACCESS_TTL_SECONDS: 900,
  REFRESH_TTL_STUDENT_SECONDS: 2_592_000,
  REFRESH_TTL_STAFF_SECONDS: 604_800,
  COOKIE_SECURE: false,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: 5,
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: 900,
};

describe('validateEnv', () => {
  it("to'g'ri env'ni qabul qiladi va standart qiymatlarni qo'yadi", () => {
    const env = validateEnv(VALID_ENV);

    expect(env).toEqual({
      ...VALID_ENV,
      ...PARSED_AUTH_ENV,
      NODE_ENV: 'development',
      API_PORT: 3001,
      LOG_LEVEL: 'info',
    });
  });

  it('API_PORT ni songa aylantiradi', () => {
    expect(validateEnv({ ...VALID_ENV, API_PORT: '4000' }).API_PORT).toBe(4000);
  });

  it("DATABASE_URL bo'lmasa — o'zgaruvchi nomi bilan aniq xato", () => {
    const { DATABASE_URL: _omitted, ...withoutDb } = VALID_ENV;

    expect(() => validateEnv(withoutDb)).toThrow(EnvValidationError);
    expect(() => validateEnv(withoutDb)).toThrow(/DATABASE_URL/);
  });

  it.each([
    ['DATABASE_URL', 'mysql://localhost/lms'],
    ['REDIS_URL', 'http://localhost:6379'],
    ['API_PORT', '70000'],
    ['NODE_ENV', 'staging-x'],
    ['LOG_LEVEL', 'verbose'],
    ['JWT_ACCESS_SECRET', 'qisqa'],
    ['JWT_ACCESS_TTL_SECONDS', '0'],
    ['COOKIE_SECURE', 'balki'],
    ['LOGIN_RATE_LIMIT_MAX_ATTEMPTS', '-1'],
  ])("%s noto'g'ri bo'lsa rad etadi", (key, value) => {
    expect(() => validateEnv({ ...VALID_ENV, [key]: value })).toThrow(new RegExp(key));
  });
});

describe('validateEnv — production', () => {
  it("COOKIE_SECURE=false bo'lsa rad etadi", () => {
    expect(() => validateEnv({ ...VALID_ENV, NODE_ENV: 'production' })).toThrow(/COOKIE_SECURE/);
  });

  it('COOKIE_SECURE=true bilan qabul qiladi', () => {
    const env = validateEnv({ ...VALID_ENV, NODE_ENV: 'production', COOKIE_SECURE: 'true' });

    expect(env.COOKIE_SECURE).toBe(true);
  });
});

describe('AppConfigService', () => {
  it('tiplangan qiymatlarni beradi', () => {
    const config = new AppConfigService(
      validateEnv({ ...VALID_ENV, NODE_ENV: 'production', COOKIE_SECURE: 'true' }),
    );

    expect(config.get('REDIS_URL')).toBe(VALID_ENV.REDIS_URL);
    expect(config.isProduction).toBe(true);
  });
});
