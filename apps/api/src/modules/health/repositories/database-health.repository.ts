import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/**
 * Bazaga ulanishni tekshirish (`SELECT 1`). `BaseRepository` dan meros olmaydi: hech qanday
 * model/jadval bilan ishlamaydi (CRUD ma'nosiz), faqat ulanish tekshiruvi.
 */
@Injectable()
export class DatabaseHealthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<void> {
    await this.prisma.db.$queryRaw`SELECT 1`;
  }
}
