import { Global, Module } from '@nestjs/common';

import { StudentScopeGuard } from '../guards/student-scope.guard.js';

import { RoleBasedStudentScopeResolver } from './role-based-student-scope.resolver.js';
import { STUDENT_SCOPE_RESOLVER } from './student-scope.types.js';

/**
 * Scope (resursga egalik) mexanizmi — global: `@StudentScope` istalgan modul controller'ida ishlaydi.
 * 2-bosqichda `STUDENT_SCOPE_RESOLVER` guruhlarni biladigan implementatsiyaga almashtiriladi.
 */
@Global()
@Module({
  providers: [
    { provide: STUDENT_SCOPE_RESOLVER, useClass: RoleBasedStudentScopeResolver },
    StudentScopeGuard,
  ],
  exports: [STUDENT_SCOPE_RESOLVER, StudentScopeGuard],
})
export class ScopeModule {}
