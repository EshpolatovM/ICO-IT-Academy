import { Global, Module } from '@nestjs/common';

import { UnitOfWork } from '../../common/transaction/unit-of-work.js';

import { PrismaExceptionMapper } from './prisma-exception.mapper.js';
import { PrismaUnitOfWork } from './prisma-unit-of-work.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaExceptionMapper,
    PrismaUnitOfWork,
    { provide: UnitOfWork, useExisting: PrismaUnitOfWork },
  ],
  exports: [PrismaService, PrismaExceptionMapper, UnitOfWork],
})
export class PrismaModule {}
