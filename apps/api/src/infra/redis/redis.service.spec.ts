import {
  DECREMENT_IF_POSITIVE_SCRIPT,
  INCREMENT_WITH_TTL_SCRIPT,
  REPLACE_SET_IF_VERSION_SCRIPT,
  SET_IF_GREATER_SCRIPT,
  SET_IF_VERSION_SCRIPT,
  SET_MEMBERSHIP_SCRIPT,
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
    incr: jest.fn().mockResolvedValue(5),
    multi: jest.fn(),
    disconnect: jest.fn(),
  };
}

interface FakeMulti {
  del: jest.Mock<FakeMulti>;
  incr: jest.Mock<FakeMulti>;
  expire: jest.Mock<FakeMulti>;
  exec: jest.Mock<Promise<unknown[] | null>>;
}

/** `MULTI` zanjiri: har bir buyruq yoziladi, `exec` — bajariladi. */
function createFakeMulti(): FakeMulti {
  const multi: FakeMulti = {
    del: jest.fn(() => multi),
    incr: jest.fn(() => multi),
    expire: jest.fn(() => multi),
    exec: jest.fn((): Promise<unknown[] | null> => Promise.resolve([])),
  };
  return multi;
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

  it('increment: muddatsiz INCR, yangi qiymat qaytadi', async () => {
    const { client, service } = createService();

    expect(await service.increment('k')).toBe(5);
    expect(client.incr).toHaveBeenCalledWith('k');
    expect(client.expire).not.toHaveBeenCalled();
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

  it("isSetMember: kalit yo'q — null, aks holda a'zolik (Lua)", async () => {
    const { client, service } = createService();
    client.eval.mockResolvedValueOnce(-1).mockResolvedValueOnce(1).mockResolvedValueOnce(0);

    await expect(service.isSetMember('s', 'm')).resolves.toBeNull();
    await expect(service.isSetMember('s', 'm')).resolves.toBe(true);
    await expect(service.isSetMember('s', 'm')).resolves.toBe(false);
    expect(client.eval).toHaveBeenCalledWith(SET_MEMBERSHIP_SCRIPT, 1, 's', 'm');
  });

  it('replaceSetIfVersion: Lua (versiya sharti bilan), natija — yozildimi', async () => {
    const { client, service } = createService();
    client.eval.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const write = {
      key: 's',
      versionKey: 'g',
      expectedVersion: '',
      members: ['-', 'a'],
      ttlSeconds: 60,
    };

    await expect(service.replaceSetIfVersion(write)).resolves.toBe(true);
    await expect(service.replaceSetIfVersion(write)).resolves.toBe(false);
    expect(client.eval).toHaveBeenCalledWith(
      REPLACE_SET_IF_VERSION_SCRIPT,
      2,
      's',
      'g',
      '',
      60,
      '-',
      'a',
    );
  });

  it('setIfVersion: Lua (versiya sharti bilan), natija — yozildimi', async () => {
    const { client, service } = createService();
    client.eval.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const write = { key: 'k', versionKey: 'g', expectedVersion: '3', value: '{}', ttlSeconds: 600 };

    await expect(service.setIfVersion(write)).resolves.toBe(true);
    await expect(service.setIfVersion(write)).resolves.toBe(false);
    expect(client.eval).toHaveBeenCalledWith(SET_IF_VERSION_SCRIPT, 2, 'k', 'g', '3', '{}', 600);
  });

  it('bumpVersionsAndDelete: bitta MULTI — har versiyaga INCR + EXPIRE, bitta DEL', async () => {
    const { client, service } = createService();
    const multi = createFakeMulti();
    client.multi.mockReturnValue(multi);

    await service.bumpVersionsAndDelete(
      [
        { versionKey: 'g1', dataKey: 's1' },
        { versionKey: 'g2', dataKey: 's2' },
      ],
      100,
    );
    expect(multi.incr).toHaveBeenCalledWith('g1');
    expect(multi.incr).toHaveBeenCalledWith('g2');
    expect(multi.expire).toHaveBeenCalledWith('g1', 100);
    expect(multi.del).toHaveBeenCalledTimes(1);
    expect(multi.del).toHaveBeenCalledWith('s1', 's2');
    expect(multi.exec).toHaveBeenCalledTimes(1);

    client.multi.mockClear();
    await service.bumpVersionsAndDelete([], 100);
    expect(client.multi).not.toHaveBeenCalled();
  });

  it('bumpVersionsAndDelete: EXEC bekor qilinsa yoki buyruq xato bersa — rad etiladi', async () => {
    const { client, service } = createService();
    const multi = createFakeMulti();
    client.multi.mockReturnValue(multi);
    const entries = [{ versionKey: 'g', dataKey: 's' }];

    multi.exec.mockResolvedValueOnce(null);
    await expect(service.bumpVersionsAndDelete(entries, 1)).rejects.toThrow('bekor');

    multi.exec.mockResolvedValueOnce([
      [null, 1],
      [new Error('WRONGTYPE'), null],
    ]);
    await expect(service.bumpVersionsAndDelete(entries, 1)).rejects.toThrow('WRONGTYPE');
  });
});
