import { Module } from '@nestjs/common';

import { StudentCodeRepository } from './repositories/student-code.repository.js';
import { UsersRepository } from './repositories/users.repository.js';

/** Foydalanuvchilar moduli — hozircha student kodi generatori va auth uchun `UsersRepository` (CRUD — 2-modul). */
@Module({
  providers: [StudentCodeRepository, UsersRepository],
  exports: [StudentCodeRepository, UsersRepository],
})
export class UsersModule {}
