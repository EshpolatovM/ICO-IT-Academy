import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { RedisService } from '../../src/infra/redis/redis.service.js';
import { LOGIN_IP_ATTEMPTS_KEY_PREFIX } from '../../src/modules/auth/auth.constants.js';

import type { INestApplication, Type } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { App } from 'supertest/types.js';

export interface TestAppOptions {
  redisOverride?: Partial<RedisService>;
  /** Faqat testda ishlatiladigan qo'shimcha controller'lar (masalan `@Roles` tekshiruvi uchun). */
  controllers?: Type[];
}

const EPHEMERAL_PORT = 0;
const LOOPBACK_HOST = '127.0.0.1';

/** Supertest so'rovlari keladigan lokal manzil ko'rinishlari (IP bo'yicha limit kalitlari uchun). */
export const LOCAL_IPS = ['::ffff:127.0.0.1', '127.0.0.1', '::1'] as const;

/**
 * IP bo'yicha umumiy login hisoblagichini tozalaydi: barcha e2e suite'lar bir IP'dan keladi va
 * ataylab xato loginlar ketma-ket ishga tushirishlarda yig'ilib, keyingi suite'larni 429 qilmasin.
 */
export async function resetLoginIpLimits(app: INestApplication<App>): Promise<void> {
  const redis = app.get(RedisService);
  for (const ip of LOCAL_IPS) {
    await redis.del(`${LOGIN_IP_ATTEMPTS_KEY_PREFIX}${ip}`);
  }
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
  const app = (await builder.compile()).createNestApplication<
    NestExpressApplication & INestApplication<App>
  >({
    bufferLogs: true,
  });
  configureApp(app);
  // Tasodifiy port, faqat loopback: supertest har so'rovda serverni qayta `listen` qilmaydi
  // (parallel so'rovli testlarda MaxListeners ogohlantirishi bo'lmasin).
  await app.listen(EPHEMERAL_PORT, LOOPBACK_HOST);
  if (!options.redisOverride) {
    await resetLoginIpLimits(app);
  }
  return app;
}
