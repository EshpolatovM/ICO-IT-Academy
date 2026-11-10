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
    incr: jest.fn().mockResolvedValue(3),
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

  it("incrementWithTtl: kalit yo'q bo'lsa TTL bilan yaratadi (NX), so'ng INCR", async () => {
    const { client, service } = createService();

    expect(await service.incrementWithTtl('k', 900)).toBe(3);
    expect(client.set).toHaveBeenCalledWith('k', '0', 'EX', 900, 'NX');
    expect(client.incr).toHaveBeenCalledWith('k');
  });
});
