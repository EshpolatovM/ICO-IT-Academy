import {
  DECREMENT_IF_POSITIVE_SCRIPT,
  INCREMENT_WITH_TTL_SCRIPT,
  SET_IF_GREATER_SCRIPT,
  SET_UNLESS_BLOCKED_SCRIPT,
} from './redis-scripts.js';
import { RedisService } from './redis.service.js';

import type { Redis } from 'ioredis';

function createFakeClient(status = 'ready') {
  return {
    status,
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue('qiymat'),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(3),
    mget: jest.fn().mockResolvedValue(['a', null]),
    expire: jest.fn().mockResolvedValue(1),
    disconnect: jest.fn(),
  };
}

function createService(status?: string) {
  const client = createFakeClient(status);
  return { client, service: new RedisService(client as unknown as Redis) };
}

describe('RedisService', () => {
  it("xato hodisasiga obuna bo'ladi (unhandled error bo'lmasin)", () => {
    const { client } = createService();

    expect(client.on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('ishga tushishda ulanadi, yopilishda quit qiladi', async () => {
    const { client, service } = createService();

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.quit).toHaveBeenCalledTimes(1);
  });

  it.each(['wait', 'reconnecting', 'end'])(
    "holat %s bo'lsa quit o'rniga disconnect (navbatsiz buyruq xato bermasin)",
    async (status) => {
      const { client, service } = createService(status);

      await service.onModuleDestroy();

      expect(client.quit).not.toHaveBeenCalled();
      expect(client.disconnect).toHaveBeenCalledTimes(1);
    },
  );

  it('ping klient xatosini uzatadi', async () => {
    const { client, service } = createService();

    await expect(service.ping()).resolves.toBeUndefined();
    client.ping.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    await expect(service.ping()).rejects.toThrow('ECONNREFUSED');
  });

  it('get/set/del klientga uzatiladi, TTL EX bilan', async () => {
    const { client, service } = createService();

    expect(await service.get('k')).toBe('qiymat');
    await service.set('k', 'v');
    await service.set('k', 'v', 60);
    expect(await service.del('k')).toBe(1);

    expect(client.set).toHaveBeenNthCalledWith(1, 'k', 'v');
    expect(client.set).toHaveBeenNthCalledWith(2, 'k', 'v', 'EX', 60);
  });

  it('incrementWithTtl: bitta atomar Lua skript (INCR + EXPIRE NX)', async () => {
    const { client, service } = createService();

    expect(await service.incrementWithTtl('k', 900)).toBe(3);
    expect(client.eval).toHaveBeenCalledWith(INCREMENT_WITH_TTL_SCRIPT, 1, 'k', 900);
    expect(INCREMENT_WITH_TTL_SCRIPT).toContain("'EXPIRE', KEYS[1], ARGV[1], 'NX'");
    expect(client.set).not.toHaveBeenCalled();
  });

  it('decrementIfPositive / setIfGreater / setUnlessExists — Lua skriptlari', async () => {
    const { client, service } = createService();

    client.eval.mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    expect(await service.decrementIfPositive('k')).toBe(2);
    expect(await service.setIfGreater('v', 7, 600)).toBe(true);
    expect(await service.setUnlessExists('a', 'b', 'x', 300)).toBe(false);

    expect(client.eval).toHaveBeenNthCalledWith(1, DECREMENT_IF_POSITIVE_SCRIPT, 1, 'k');
    expect(client.eval).toHaveBeenNthCalledWith(2, SET_IF_GREATER_SCRIPT, 1, 'v', 7, 600);
    expect(client.eval).toHaveBeenNthCalledWith(
      3,
      SET_UNLESS_BLOCKED_SCRIPT,
      2,
      'a',
      'b',
      'x',
      300,
    );
  });

  it('getMany: MGET kalitlar tartibida', async () => {
    const { client, service } = createService();

    expect(await service.getMany(['a', 'b'])).toEqual(['a', null]);
    expect(client.mget).toHaveBeenCalledWith('a', 'b');
  });

  it('expire: kalitga yangi muddat beradi', async () => {
    const { client, service } = createService();

    await service.expire('k', 3600);
    expect(client.expire).toHaveBeenCalledWith('k', 3600);
  });
});
