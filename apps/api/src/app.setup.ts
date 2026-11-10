import { Logger } from 'nestjs-pino';

import { API_GLOBAL_PREFIX } from './common/constants/app.constants.js';

import type { INestApplication } from '@nestjs/common';

/** `main.ts` va e2e testlar uchun umumiy ilova sozlamasi. */
export function configureApp(app: INestApplication): void {
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.enableShutdownHooks();
}
