import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { StudentScopeGuard } from '../guards/student-scope.guard.js';
import { STUDENT_SCOPE_PARAM_KEY } from '../scope/student-scope.types.js';

/**
 * URL parametridagi student uchun scope tekshiruvi (docs/01 §3.2):
 *
 *   @StudentScope('id')  // `/students/:id/...`
 *
 * Scope'dan tashqari — 404 (mavjudligi oshkor qilinmaydi, docs/12 §0).
 */
export const StudentScope = (param: string): MethodDecorator & ClassDecorator =>
  applyDecorators(SetMetadata(STUDENT_SCOPE_PARAM_KEY, param), UseGuards(StudentScopeGuard));
