import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { AppConfigService } from '../../common/config/app-config.service.js';

import { PrismaClient } from './generated/client.js';
import { softDeleteExtension } from './soft-delete.extension.js';

import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';

function createSoftDeleteClient(base: PrismaClient) {
  return base.$extends(softDeleteExtension);
}

/** Soft delete filtrli Prisma klienti tipi (repository'lar uchun standart). */
export type AppPrismaClient = ReturnType<typeof createSoftDeleteClient>;

/** Interaktiv tranzaksiya ichidagi klient (soft delete filtri bilan) — `$transaction` callback argumenti. */
export type AppTransactionClient = Parameters<Parameters<AppPrismaClient['$transaction']>[0]>[0];

/**
 * Prisma ulanishi (`PrismaPg` driver adapter, Prisma 7). Faqat repository'lar ishlatadi
 * (dependency-cruiser qoidasi).
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /** Filtrsiz klient — soft delete qilinganlarni ham ko'rish kerak bo'lgan kam holatlar uchun (ochiq usul). */
  readonly dbIncludingDeleted: PrismaClient;
  /** Standart klient: soft delete'li modellarda o'chirilganlar avtomatik yashiriladi. */
  readonly db: AppPrismaClient;

  /** Joriy so'rov zanjiridagi ochiq tranzaksiya (`transaction()` ichida). */
  private readonly activeTransaction = new AsyncLocalStorage<AppTransactionClient>();

  constructor(config: AppConfigService) {
    const adapter = new PrismaPg({ connectionString: config.get('DATABASE_URL') });
    this.dbIncludingDeleted = new PrismaClient({ adapter });
    this.db = createSoftDeleteClient(this.dbIncludingDeleted);
  }

  /**
   * Joriy klient: `transaction()` ichida — o'sha tranzaksiya, aks holda standart `db`. Tashqi amal
   * (masalan `UnitOfWork.run`) bilan bir tranzaksiyada ishlashi kerak bo'lgan repository usullari shuni ishlatadi.
   */
  get client(): AppTransactionClient {
    return this.activeTransaction.getStore() ?? this.db;
  }

  /**
   * Interaktiv tranzaksiya. Ochiq tranzaksiya ichida chaqirilsa — yangisi ochilmaydi, o'shanga qo'shiladi
   * (repository'ning o'z tranzaksiyasi tashqi `UnitOfWork.run` ga qo'shilishi uchun).
   */
  async transaction<T>(work: (tx: AppTransactionClient) => Promise<T>): Promise<T> {
    const current = this.activeTransaction.getStore();
    if (current) {
      return work(current);
    }
    return this.db.$transaction((tx) => this.activeTransaction.run(tx, () => work(tx)));
  }

  async onModuleInit(): Promise<void> {
    await this.dbIncludingDeleted.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.dbIncludingDeleted.$disconnect();
  }
}
