import { Global, Module } from '@nestjs/common';

import { MentorStudentScope } from '../../common/scope/mentor-student-scope.js';

import { MentorScopeRepository } from './repositories/mentor-scope.repository.js';
import { MentorScopeCache } from './services/mentor-scope-cache.service.js';
import { CachedMentorStudentScope } from './services/mentor-student-scope.service.js';

/**
 * Mentor scope'i (docs/01 §3) — global: `ScopeModule` dagi `StudentScopeResolver` `MentorStudentScope`
 * ni, guruh va foydalanuvchi o'zgarishlari esa `MentorScopeCache` (invalidatsiya) ni ishlatadi.
 */
@Global()
@Module({
  providers: [
    MentorScopeRepository,
    MentorScopeCache,
    CachedMentorStudentScope,
    { provide: MentorStudentScope, useExisting: CachedMentorStudentScope },
  ],
  exports: [MentorStudentScope, MentorScopeCache],
})
export class MentorScopeModule {}
