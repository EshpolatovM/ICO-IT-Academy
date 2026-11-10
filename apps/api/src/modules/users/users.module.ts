import { Module } from '@nestjs/common';

import { StudentCodeRepository } from './repositories/student-code.repository.js';

/** Foydalanuvchilar moduli — hozircha faqat student kodi generatori (CRUD — 2-modul). */
@Module({
  providers: [StudentCodeRepository],
  exports: [StudentCodeRepository],
})
export class UsersModule {}
