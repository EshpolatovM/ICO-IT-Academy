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

  constructor(config: AppConfigService) {
    const adapter = new PrismaPg({ connectionString: config.get('DATABASE_URL') });
    this.dbIncludingDeleted = new PrismaClient({ adapter });
    this.db = createSoftDeleteClient(this.dbIncludingDeleted);
  }

  async onModuleInit(): Promise<void> {
    await this.dbIncludingDeleted.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.dbIncludingDeleted.$disconnect();
  }
}
