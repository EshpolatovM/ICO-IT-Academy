import { Module } from '@nestjs/common';

import { GroupMembersRepository } from './repositories/group-members.repository.js';
import { GroupsRepository } from './repositories/groups.repository.js';
import { GroupEnrollmentService } from './services/group-enrollment.service.js';

/**
 * Guruhlar (docs/11 §2). Hozircha faqat a'zolik servisi — studentni yaratishda guruhga qo'shish
 * uchun (2.2). Guruhlar CRUD, a'zolar va mentor scope — 2.3.
 */
@Module({
  providers: [GroupsRepository, GroupMembersRepository, GroupEnrollmentService],
  exports: [GroupEnrollmentService],
})
export class GroupsModule {}
