import { Injectable } from '@nestjs/common';

import { Role } from '@lms/shared';

import { MentorStudentScope } from './mentor-student-scope.js';

import type { StudentScopeResolver } from './student-scope.types.js';
import type { RequestUser } from '../auth/request-user.types.js';

/**
 * Scope qoidalari (docs/01 §3.2):
 * - SUPER_ADMIN, ADMIN — barcha studentlar;
 * - MENTOR — faqat o'z ACTIVE guruhlarining faol a'zolari (`MentorStudentScope`, Redis keshli);
 *   guruhdan chiqqan student — scope'dan tashqarida (S-10 A);
 * - STUDENT — faqat o'zi;
 * - PARENT — faqat sessiyadagi (hali amalda bo'lgan tokenli) farzandlar.
 * Scope'dan tashqari — `false` (guard 404 qaytaradi, docs/12 §0).
 */
@Injectable()
export class RoleBasedStudentScopeResolver implements StudentScopeResolver {
  constructor(private readonly mentorScope: MentorStudentScope) {}

  canAccess(user: RequestUser, studentId: string): Promise<boolean> {
    switch (user.role) {
      case Role.SUPER_ADMIN:
      case Role.ADMIN:
        return Promise.resolve(true);
      case Role.MENTOR:
        return this.mentorScope.isMentorOf(user.id, studentId);
      case Role.STUDENT:
        return Promise.resolve(user.id === studentId);
      case Role.PARENT:
        return Promise.resolve(user.studentIds.includes(studentId));
    }
  }
}
