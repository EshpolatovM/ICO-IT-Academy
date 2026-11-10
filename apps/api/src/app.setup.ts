import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';

import { AppConfigService } from './common/config/app-config.service.js';
import { API_GLOBAL_PREFIX } from './common/constants/app.constants.js';
import { securityHeaders } from './common/security/security-headers.js';

import type { NestExpressApplication } from '@nestjs/platform-express';

/** Express sozlamasi nomi: ishonchli proksilar (`req.ip` ni `X-Forwarded-For` dan olish). */
const TRUST_PROXY_SETTING = 'trust proxy';

/** `main.ts` va e2e testlar uchun umumiy ilova sozlamasi. */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(AppConfigService);
  app.useLogger(app.get(Logger));
  // Rate limit, sessiya IP, audit va parent_access_logs mijozning haqiqiy IP'sini ko'rishi uchun.
  app.set(TRUST_PROXY_SETTING, config.get('TRUST_PROXY'));
  // Xavfsizlik header'lari — barcha javoblarga, xatolarga ham (docs/13 §8).
  app.use(securityHeaders(config.isProduction));
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  // Refresh token `rt` cookie'sini o'qish uchun (docs/02 §3).
  app.use(cookieParser());
  app.enableShutdownHooks();
}
