import { AuthFixtures } from './auth-fixtures.js';
import { createTestApp } from './create-test-app.js';

import type { TestAppOptions } from './create-test-app.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

export interface E2eContext {
  app: INestApplication<App>;
  fixtures: AuthFixtures;
}

/**
 * `describe` ichida chaqiriladi: ilova `beforeAll` da ko'tariladi, `afterAll` da test yozuvlari
 * tozalanadi va ilova yopiladi. Qiymatlar hook'lardan keyin (testlar ichida) o'qiladi.
 */
export function useE2eContext(options: TestAppOptions = {}): E2eContext {
  const context = {} as E2eContext;
  beforeAll(async () => {
    context.app = await createTestApp(options);
    context.fixtures = new AuthFixtures(context.app);
  });
  afterAll(async () => {
    await context.fixtures.cleanup();
    await context.app.close();
  });
  return context;
}
