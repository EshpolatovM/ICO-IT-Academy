import { Global, Module } from '@nestjs/common';

import { AppConfigService } from './app-config.service.js';
import { validateEnv } from './env.schema.js';

/** Global konfiguratsiya moduli: `process.env` faqat shu yerda o'qiladi va zod bilan tekshiriladi. */
@Global()
@Module({
  providers: [
    {
      provide: AppConfigService,
      useFactory: (): AppConfigService => new AppConfigService(validateEnv(process.env)),
    },
  ],
  exports: [AppConfigService],
})
export class AppConfigModule {}
