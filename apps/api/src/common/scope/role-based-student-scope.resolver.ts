import { Injectable } from '@nestjs/common';

import { ErrorCode, Role } from '@lms/shared';

import { AppException } from '../exceptions/app.exception.js';

import type { StudentScopeResolver } from './student-scope.types.js';
import type { RequestUser } from '../auth/request-user.types.js';

/** Mentor scope'i hali yoqilmaganligi haqidagi xabar (guruhlar 2-bosqichda). */
export const MENTOR_SCOPE_UNAVAILABLE_MESSAGE =
  'Mentor uchun bu amal guruhlar moduli (2-bosqich) bilan yoqiladi';

/**
 * Hozirgi (1-bosqich) scope qoidalari (docs/01 §3.2):
 * - SUPER_ADMIN, ADMIN — barcha studentlar;
 * - STUDENT — faqat o'zi;
 * - PARENT — faqat sessiyadagi (hali amalda bo'lgan tokenli) farzandlar;
 * - MENTOR — guruhlar hali yo'q, shuning uchun har doim yopiq: 403 (egasi qarori, 1.6).
 *   2-bosqichda `group_members` asosidagi implementatsiya bilan almashtiriladi
 *   (`EXISTS ... g.mentor_id = currentMentor AND gm.left_at IS NULL`), u scope'dan tashqari
 *   studentlar uchun `false` (→ 404) qaytaradi.
 */
@Injectable()
export class RoleBasedStudentScopeResolver implements StudentScopeResolver {
  canAccess(user: RequestUser, studentId: string): Promise<boolean> {
    switch (user.role) {
      case Role.SUPER_ADMIN:
      case Role.ADMIN:
        return Promise.resolve(true);
      case Role.STUDENT:
        return Promise.resolve(user.id === studentId);
      case Role.PARENT:
        return Promise.resolve(user.studentIds.includes(studentId));
      case Role.MENTOR:
        return Promise.reject(
          new AppException({
            code: ErrorCode.FORBIDDEN,
            message: MENTOR_SCOPE_UNAVAILABLE_MESSAGE,
          }),
        );
    }
  }
}
