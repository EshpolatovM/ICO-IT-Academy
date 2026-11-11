import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { AppConfigService } from '../../common/config/app-config.service.js';

import { buildPinoHttpOptions } from './pino-options.js';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: buildPinoHttpOptions(config.get('LOG_LEVEL')),
      }),
    }),
  ],
})
export class AppLoggerModule {}
