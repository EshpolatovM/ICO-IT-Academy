import { Module } from '@nestjs/common';

import { SecurityModule } from '../../common/security/security.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';

import { PasswordResetController } from './controllers/password-reset.controller.js';
import { PasswordResetService } from './services/password-reset.service.js';

/** Admin/mentor tomonidan parolni tiklash (docs/02 §4.3). */
@Module({
  imports: [UsersModule, SecurityModule, AuthModule, AuditModule],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
})
export class PasswordResetModule {}
