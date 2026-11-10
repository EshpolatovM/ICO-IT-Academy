import { Inject, Injectable, Logger } from '@nestjs/common';

import { REDIS_CLIENT } from './redis.constants.js';

import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Redis } from 'ioredis';

/** Faqat to'liq ulangan klient `QUIT` yubora oladi; aks holda (ulanmagan/qayta ulanmoqda) — `disconnect`. */
const READY_STATUS = 'ready';

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
}
