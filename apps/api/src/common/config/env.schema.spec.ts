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
  WEB_BASE_URL: 'http://localhost:3000',
  PARENT_TOKEN_PEPPER: 'p'.repeat(32),
  PARENT_COOKIE_KEY: Buffer.alloc(32, 7).toString('base64'),
  PARENT_SESSION_TTL_SECONDS: '43200',
  PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS: '15552000',
  PARENT_MAX_ACTIVE_TOKENS: '3',
  PARENT_EXCHANGE_MAX_ATTEMPTS: '10',
  PARENT_EXCHANGE_WINDOW_SECONDS: '900',
  PARENT_EXCHANGE_MAX_FAILURES: '20',
  PARENT_EXCHANGE_BLOCK_SECONDS: '3600',
};

const PARSED_AUTH_ENV = {
  JWT_ACCESS_SECRET: 'x'.repeat(32),
  JWT_ACCESS_TTL_SECONDS: 900,
  REFRESH_TTL_STUDENT_SECONDS: 2_592_000,
  REFRESH_TTL_STAFF_SECONDS: 604_800,
  COOKIE_SECURE: false,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS: 5,
  LOGIN_RATE_LIMIT_WINDOW_SECONDS: 900,
  PARENT_SESSION_TTL_SECONDS: 43_200,
  PARENT_TOKENS_COOKIE_MAX_AGE_SECONDS: 15_552_000,
  PARENT_MAX_ACTIVE_TOKENS: 3,
  PARENT_EXCHANGE_MAX_ATTEMPTS: 10,
  PARENT_EXCHANGE_WINDOW_SECONDS: 900,
  PARENT_EXCHANGE_MAX_FAILURES: 20,
  PARENT_EXCHANGE_BLOCK_SECONDS: 3600,
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

  it("WEB_BASE_URL oxiridagi '/' olib tashlanadi", () => {
    expect(
      validateEnv({ ...VALID_ENV, WEB_BASE_URL: 'https://app.example.uz/' }).WEB_BASE_URL,
    ).toBe('https://app.example.uz');
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
    ['WEB_BASE_URL', 'ftp://localhost'],
    ['PARENT_TOKEN_PEPPER', 'qisqa'],
    ['PARENT_COOKIE_KEY', Buffer.alloc(16).toString('base64')],
    ['PARENT_COOKIE_KEY', 'base64-emas!'],
    ['PARENT_MAX_ACTIVE_TOKENS', '0'],
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
