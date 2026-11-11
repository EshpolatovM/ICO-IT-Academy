import { Injectable } from '@nestjs/common';

import { UnitOfWork } from '../../common/transaction/unit-of-work.js';

import { PrismaService } from './prisma.service.js';

/** `UnitOfWork` ning Prisma interaktiv tranzaksiyasi asosidagi amalga oshirilishi. */
@Injectable()
export class PrismaUnitOfWork extends UnitOfWork {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.transaction(() => work());
  }
}
