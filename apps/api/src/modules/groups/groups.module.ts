import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';

import { AdminGroupsController } from './controllers/admin-groups.controller.js';
import { AdminPathsController } from './controllers/admin-paths.controller.js';
import { MentorController } from './controllers/mentor.controller.js';
import { GroupCandidatesRepository } from './repositories/group-candidates.repository.js';
import { GroupMembersRepository } from './repositories/group-members.repository.js';
import { GroupsRepository } from './repositories/groups.repository.js';
import { LearningPathsRepository } from './repositories/learning-paths.repository.js';
import { MentorGroupsRepository } from './repositories/mentor-groups.repository.js';
import { AdminGroupsService } from './services/admin-groups.service.js';
import { GroupAuditor } from './services/group-auditor.service.js';
import { GroupDetailsService } from './services/group-details.service.js';
import { GroupEnrollmentService } from './services/group-enrollment.service.js';
import { GroupMembersService } from './services/group-members.service.js';
import { GroupMentorService } from './services/group-mentor.service.js';
import { GroupReferences } from './services/group-references.service.js';
import { GroupTransaction } from './services/group-transaction.service.js';
import { LearningPathsService } from './services/learning-paths.service.js';
import { MentorGroupsService } from './services/mentor-groups.service.js';

/**
 * Guruhlar (docs/11 §2, docs/12 §2, §12): `/admin/groups` (SA A — CRUD, mentor, a'zolar),
 * `/admin/paths` (SA A — yo'llar ro'yxati), `/mentor/*` (M — o'z guruhlari va studentlari).
 * Mentor scope keshi (`MentorScopeCache`) — global `MentorScopeModule` dan.
 * `GroupEnrollmentService` — studentni yaratishda guruhga qo'shish uchun (admin-users).
 */
@Module({
  imports: [AuditModule],
  controllers: [AdminGroupsController, AdminPathsController, MentorController],
  providers: [
    GroupsRepository,
    GroupMembersRepository,
    GroupCandidatesRepository,
    LearningPathsRepository,
    MentorGroupsRepository,
    GroupAuditor,
    GroupDetailsService,
    GroupReferences,
    GroupTransaction,
    AdminGroupsService,
    GroupMentorService,
    GroupMembersService,
    GroupEnrollmentService,
    LearningPathsService,
    MentorGroupsService,
  ],
  exports: [GroupEnrollmentService],
})
export class GroupsModule {}
