import { Logger } from '@nestjs/common';

import { TOKEN_VERSION_CACHE_TTL_SECONDS } from '../auth.constants.js';

import { TokenVersionService } from './token-version.service.js';

import type { RedisService } from '../../../infra/redis/redis.service.js';
import type { UsersRepository } from '../../users/repositories/users.repository.js';

function createService(cached: string | null, dbVersion: number | null) {
  const redis = {
    get: jest.fn().mockResolvedValue(cached),
    set: jest.fn().mockResolvedValue(undefined),
  };
  const users = { findTokenVersion: jest.fn().mockResolvedValue(dbVersion) };
  const service = new TokenVersionService(
    redis as unknown as RedisService,
    users as unknown as UsersRepository,
  );
  return { redis, users, service };
}

describe('TokenVersionService', () => {
  it('keshda bor — bazaga murojaat qilinmaydi', async () => {
    const { users, service } = createService('4', 9);

    expect(await service.current('u1')).toBe(4);
    expect(users.findTokenVersion).not.toHaveBeenCalled();
  });

  it("keshda yo'q — bazadan olib, user:ver:{id} kalitiga TTL bilan yozadi", async () => {
    const { redis, service } = createService(null, 2);

    expect(await service.current('u1')).toBe(2);
    expect(redis.set).toHaveBeenCalledWith('user:ver:u1', '2', TOKEN_VERSION_CACHE_TTL_SECONDS);
  });

  it('foydalanuvchi topilmasa — null, keshlanmaydi', async () => {
    const { redis, service } = createService(null, null);

    expect(await service.current('u1')).toBeNull();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it("Redis ishlamasa — bazadan oladi (so'rov yiqilmaydi)", async () => {
    const loggerWarn = jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    const { redis, service } = createService(null, 5);
    redis.get.mockRejectedValue(new Error('ECONNREFUSED'));
    redis.set.mockRejectedValue(new Error('ECONNREFUSED'));

    expect(await service.current('u1')).toBe(5);
    expect(loggerWarn).toHaveBeenCalledTimes(2);
    loggerWarn.mockRestore();
  });

  it('remember — keshni yangi qiymat bilan yangilaydi', async () => {
    const { redis, service } = createService(null, null);

    await service.remember('u1', 7);

    expect(redis.set).toHaveBeenCalledWith('user:ver:u1', '7', TOKEN_VERSION_CACHE_TTL_SECONDS);
  });
});
