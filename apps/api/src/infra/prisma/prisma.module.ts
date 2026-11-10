import { Global, Module } from '@nestjs/common';

import { PrismaExceptionMapper } from './prisma-exception.mapper.js';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService, PrismaExceptionMapper],
  exports: [PrismaService, PrismaExceptionMapper],
})
export class PrismaModule {}
