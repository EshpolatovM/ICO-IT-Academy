import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AppConfigService } from '../../common/config/app-config.service.js';
import { SecurityModule } from '../../common/security/security.module.js';
import { AuditModule } from '../audit/audit.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { GroupsModule } from '../groups/groups.module.js';
import { ParentAccessModule } from '../parent-access/parent-access.module.js';
import { UsersModule } from '../users/users.module.js';

import { AdminMentorsController } from './controllers/admin-mentors.controller.js';
import { AdminStudentsController } from './controllers/admin-students.controller.js';
import { SuperAdminsController } from './controllers/super-admins.controller.js';
import { UserAccountsRepository } from './repositories/user-accounts.repository.js';
import { UserSearchRepository } from './repositories/user-search.repository.js';
import { AccountStatusService } from './services/account-status.service.js';
import { AccountUpdateService } from './services/account-update.service.js';
import { AdminAccountsService } from './services/admin-accounts.service.js';
import { InitialPasswordService } from './services/initial-password.service.js';
import { MentorAccountsService } from './services/mentor-accounts.service.js';
import { StaffAccountCreator } from './services/staff-account-creator.service.js';
import { StudentAccountCreator } from './services/student-account-creator.service.js';
import { StudentAccountsService } from './services/student-accounts.service.js';
import { StudentImportParser } from './services/student-import-parser.service.js';
import { StudentImportWriter } from './services/student-import-writer.service.js';
import { StudentImportService } from './services/student-import.service.js';

/** CSV import: bitta fayl, xotirada; hajm chegarasi — env (oshsa multer 413 beradi). */
const IMPORT_MAX_FILES = 1;

/**
 * Foydalanuvchilarni boshqarish (docs/12 §2): `/super/admins` (SA), `/admin/mentors`,
 * `/admin/students` (SA A) — ro'yxat, yaratish, o'zgartirish, deaktivatsiya, CSV import.
 * `UsersModule` dan alohida: u auth va ota-ona modullariga xizmat qiladi (sikl bo'lmasin).
 */
@Module({
  imports: [
    UsersModule,
    SecurityModule,
    AuditModule,
    AuthModule,
    ParentAccessModule,
    GroupsModule,
    MulterModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        limits: { fileSize: config.get('STUDENT_IMPORT_MAX_FILE_BYTES'), files: IMPORT_MAX_FILES },
      }),
    }),
  ],
  controllers: [SuperAdminsController, AdminMentorsController, AdminStudentsController],
  providers: [
    UserAccountsRepository,
    UserSearchRepository,
    InitialPasswordService,
    AccountStatusService,
    AccountUpdateService,
    StaffAccountCreator,
    StudentAccountCreator,
    AdminAccountsService,
    MentorAccountsService,
    StudentAccountsService,
    StudentImportParser,
    StudentImportWriter,
    StudentImportService,
  ],
})
export class AdminUsersModule {}
