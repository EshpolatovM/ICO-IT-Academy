import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

/** Bazaga ulanishni tekshirish (`SELECT 1`). */
@Injectable()
export class DatabaseHealthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<void> {
    await this.prisma.db.$queryRaw`SELECT 1`;
  }
}
