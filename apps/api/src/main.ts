import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';
import { API_GLOBAL_PREFIX, DEFAULT_API_PORT } from './common/constants/app.constants.js';

function resolvePort(): number {
  const rawPort = process.env.API_PORT;
  return rawPort ? Number(rawPort) : DEFAULT_API_PORT;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  const port = resolvePort();
  await app.listen(port);
  Logger.log(
    `API http://localhost:${port}/${API_GLOBAL_PREFIX} manzilida ishga tushdi`,
    'Bootstrap',
  );
}

void bootstrap();
