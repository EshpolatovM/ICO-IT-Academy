import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { AppConfigService } from './common/config/app-config.service.js';
import { API_GLOBAL_PREFIX } from './common/constants/app.constants.js';

import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  configureApp(app);
  const port = app.get(AppConfigService).get('API_PORT');
  await app.listen(port);
  app.get(Logger).log(`API http://localhost:${port}/${API_GLOBAL_PREFIX} manzilida ishga tushdi`);
}

void bootstrap();
