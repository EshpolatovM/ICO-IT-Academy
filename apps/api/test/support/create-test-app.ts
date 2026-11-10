import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { RedisService } from '../../src/infra/redis/redis.service.js';

import type { INestApplication, Type } from '@nestjs/common';
import type { App } from 'supertest/types.js';

export interface TestAppOptions {
  redisOverride?: Partial<RedisService>;
  /** Faqat testda ishlatiladigan qo'shimcha controller'lar (masalan `@Roles` tekshiruvi uchun). */
  controllers?: Type[];
}

/** E2E uchun to'liq ilova (`main.ts` dagi sozlamalar bilan). */
export async function createTestApp(options: TestAppOptions = {}): Promise<INestApplication<App>> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  });
  if (options.redisOverride) {
    builder.overrideProvider(RedisService).useValue(options.redisOverride);
  }
  const app = (await builder.compile()).createNestApplication<INestApplication<App>>({
    bufferLogs: true,
  });
  configureApp(app);
  await app.init();
  return app;
}
