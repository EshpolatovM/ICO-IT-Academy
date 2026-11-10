import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { RedisService } from '../src/infra/redis/redis.service.js';

import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

const HEALTH_PATH = '/api/v1/health';
const REQUEST_ID_HEADER = 'x-request-id';

async function createApp(redisOverride?: Partial<RedisService>): Promise<INestApplication<App>> {
  const builder = Test.createTestingModule({ imports: [AppModule] });
  if (redisOverride) {
    builder.overrideProvider(RedisService).useValue(redisOverride);
  }
  const app = (await builder.compile()).createNestApplication<INestApplication<App>>({
    bufferLogs: true,
  });
  configureApp(app);
  await app.init();
  return app;
}

describe('GET /api/v1/health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('DB va Redis ishlasa — 200, x-request-id bilan', async () => {
    const response = await request(app.getHttpServer()).get(HEALTH_PATH).expect(200);

    expect(response.body).toEqual({ status: 'ok', checks: { database: 'up', redis: 'up' } });
    expect(response.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
  });

  it('kiruvchi x-request-id javobda qaytariladi', async () => {
    const response = await request(app.getHttpServer())
      .get(HEALTH_PATH)
      .set(REQUEST_ID_HEADER, 'e2e-req-1')
      .expect(200);

    expect(response.headers[REQUEST_ID_HEADER]).toBe('e2e-req-1');
  });

  it("mavjud bo'lmagan route — 404 docs/12 §0 formatida", async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/yoq-route').expect(404);

    expect(response.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Topilmadi', details: null },
    });
    expect(response.headers[REQUEST_ID_HEADER]).toEqual(expect.any(String));
  });
});

describe('GET /api/v1/health (e2e) — Redis ishlamaganda', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createApp({
      ping: () => Promise.reject(new Error('ECONNREFUSED')),
      onModuleInit: () => Promise.resolve(),
      onModuleDestroy: () => Promise.resolve(),
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('503 SERVICE_UNAVAILABLE, details.checks da redis: down', async () => {
    const response = await request(app.getHttpServer()).get(HEALTH_PATH).expect(503);

    expect(response.body).toEqual({
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Servis vaqtincha ishlamayapti',
        details: { checks: { database: 'up', redis: 'down' } },
      },
    });
  });
});
