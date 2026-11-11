import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  DECREMENT_IF_POSITIVE_SCRIPT,
  INCREMENT_WITH_TTL_SCRIPT,
  SET_IF_GREATER_SCRIPT,
  SET_UNLESS_BLOCKED_SCRIPT,
} from './redis-scripts.js';
import { REDIS_CLIENT } from './redis.constants.js';

import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Redis } from 'ioredis';

/** Faqat to'liq ulangan klient `QUIT` yubora oladi; aks holda (ulanmagan/qayta ulanmoqda) — `disconnect`. */
const READY_STATUS = 'ready';
/** Lua skriptlariga beriladigan kalitlar soni (`EVAL script numkeys ...`). */
const SINGLE_KEY = 1;
const KEY_PAIR = 2;
/** Skript "yozildi" natijasi. */
const SCRIPT_APPLIED = 1;

/**
 * Redis ulanishi va oddiy wrapper (docs/13 §1, §6). Kesh strategiyalari, pub/sub, BullMQ — keyingi modullarda.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {
    this.client.on('error', (error: NodeJS.ErrnoException) => {
      this.logger.warn(`Redis xatosi: ${error.message || error.code || error.name}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status === READY_STATUS) {
      await this.client.quit();
      return;
    }
    this.client.disconnect();
  }

  /** Ulanish ishlamasa — rad etiladi (`enableOfflineQueue: false` tufayli darhol). */
  async ping(): Promise<void> {
    await this.client.ping();
  }

  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** `ttlSeconds` berilsa — kalit shu muddatdan keyin o'chadi. */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds === undefined) {
      await this.client.set(key, value);
      return;
    }
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  /** Mavjud kalitga yangi muddat beradi (masalan rate limit blokini uzaytirish). */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  /** Bir nechta kalit qiymati (`MGET`), kalitlar tartibida. */
  getMany(keys: readonly string[]): Promise<(string | null)[]> {
    return this.client.mget(...keys);
  }

  /**
   * Hisoblagichni atomar oshiradi (`INCR` + `EXPIRE NX`, Lua). Kalit yangi bo'lsa — `ttlSeconds`
   * muddat bilan (oyna birinchi urinishdan boshlanadi, keyingi oshirishlar muddatni uzaytirmaydi).
   */
  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    return Number(await this.client.eval(INCREMENT_WITH_TTL_SCRIPT, SINGLE_KEY, key, ttlSeconds));
  }

  /** Hisoblagich musbat bo'lsagina kamaytiradi (yo'q/muddati o'tgan kalit yaratilmaydi). */
  async decrementIfPositive(key: string): Promise<number> {
    return Number(await this.client.eval(DECREMENT_IF_POSITIVE_SCRIPT, SINGLE_KEY, key));
  }

  /** Compare-and-set: kalit yo'q yoki undagi son kichikroq bo'lsagina yoziladi. Yozilsa — `true`. */
  async setIfGreater(key: string, value: number, ttlSeconds: number): Promise<boolean> {
    const applied = await this.client.eval(
      SET_IF_GREATER_SCRIPT,
      SINGLE_KEY,
      key,
      value,
      ttlSeconds,
    );
    return Number(applied) === SCRIPT_APPLIED;
  }

  /** `blockerKey` mavjud bo'lmasagina `key` ga yozadi (atomar). Yozilsa — `true`. */
  async setUnlessExists(
    key: string,
    blockerKey: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const applied = await this.client.eval(
      SET_UNLESS_BLOCKED_SCRIPT,
      KEY_PAIR,
      key,
      blockerKey,
      value,
      ttlSeconds,
    );
    return Number(applied) === SCRIPT_APPLIED;
  }
}
