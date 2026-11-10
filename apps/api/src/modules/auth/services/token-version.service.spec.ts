import { Logger } from '@nestjs/common';

import { TOKEN_VERSION_CACHE_TTL_SECONDS } from '../auth.constants.js';

import { TokenVersionService } from './token-version.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';

function createService(cached: string | null, dbVersion: number | null) {
  const redis = {
    get: jest.fn().mockResolvedValue(cached),
    setIfGreater: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(1),
  };
  const users = { findTokenVersion: jest.fn().mockResolvedValue(dbVersion) };
  const service = new TokenVersionService(
    redis as unknown as RedisService,
    users as unknown as UsersRepository,
  );
  return { redis, users, service };
}

const KEY = 'user:ver:u1';

describe('TokenVersionService', () => {
  const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

  afterEach(() => {
    loggerWarn.mockClear();
  });

  afterAll(() => {
    loggerWarn.mockRestore();
  });

  it('keshda bor — bazaga murojaat qilinmaydi', async () => {
    const { users, service } = createService('4', 9);

    expect(await service.current('u1')).toBe(4);
    expect(users.findTokenVersion).not.toHaveBeenCalled();
  });

  it("keshda yo'q — bazadan olib, 'faqat kattaroq' CAS bilan TTL ga yozadi", async () => {
    const { redis, service } = createService(null, 2);

    expect(await service.current('u1')).toBe(2);
    expect(redis.setIfGreater).toHaveBeenCalledWith(KEY, 2, TOKEN_VERSION_CACHE_TTL_SECONDS);
  });

  it('foydalanuvchi topilmasa — null, keshlanmaydi', async () => {
    const { redis, service } = createService(null, null);

    expect(await service.current('u1')).toBeNull();
    expect(redis.setIfGreater).not.toHaveBeenCalled();
  });

  it("Redis ishlamasa — bazadan oladi (so'rov yiqilmaydi)", async () => {
    const { redis, service } = createService(null, 5);
    redis.get.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.setIfGreater.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await service.current('u1')).toBe(5);
    expect(loggerWarn).toHaveBeenCalledTimes(2);
  });

  it('onVersionChanged — CAS bilan yangilaydi', async () => {
    const { redis, service } = createService(null, null);

    await service.onVersionChanged('u1', 7);

    expect(redis.setIfGreater).toHaveBeenCalledWith(KEY, 7, TOKEN_VERSION_CACHE_TTL_SECONDS);
    expect(redis.del).not.toHaveBeenCalled();
  });

  it("onVersionChanged — yozib bo'lmasa kalit o'chiriladi", async () => {
    const { redis, service } = createService(null, null);
    redis.setIfGreater.mockRejectedValue(new Error('timeout'));

    await expect(service.onVersionChanged('u1', 7)).resolves.toBeUndefined();
    expect(redis.del).toHaveBeenCalledWith(KEY);
  });

  it("onVersionChanged — o'chirib ham bo'lmasa xato yuqoriga uzatiladi (yutilmaydi)", async () => {
    const { redis, service } = createService(null, null);
    redis.setIfGreater.mockRejectedValue(new Error('timeout'));
    redis.del.mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(service.onVersionChanged('u1', 7)).rejects.toThrow('ECONNREFUSED');
  });
});
