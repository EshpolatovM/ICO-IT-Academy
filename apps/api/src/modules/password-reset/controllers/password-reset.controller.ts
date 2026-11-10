import { Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';

import { Role } from '@lms/shared';
import type { PasswordResetResponse } from '@lms/shared';

import { Actor } from '../../../common/decorators/actor.decorator.js';
import { NoStore } from '../../../common/decorators/no-store.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { StaffStudentAccess } from '../../../common/decorators/staff-student-access.decorator.js';
import { PasswordResetService } from '../services/password-reset.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';

/**
 * Parolni tiklash (docs/12 §2, docs/02 §4.3). Vaqtinchalik parol faqat shu javobda (keshlanmaydi).
 * - `POST /students/:id/reset-password` — SA A M (mentor — `@StudentScope`, 2-bosqichgacha yopiq);
 * - `POST /staff/:id/reset-password` — SA (admin va mentor uchun), A (faqat mentor uchun).
 */
@Controller()
export class PasswordResetController {
  constructor(private readonly passwordReset: PasswordResetService) {}

  @StaffStudentAccess('id')
  @Post('students/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @NoStore()
  resetStudent(
    @Param('id', ParseUUIDPipe) studentId: string,
    @Actor() actor: ActorContext,
  ): Promise<PasswordResetResponse> {
    return this.passwordReset.resetStudent(studentId, actor);
  }

  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('staff/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @NoStore()
  resetStaff(
    @Param('id', ParseUUIDPipe) staffId: string,
    @Actor() actor: ActorContext,
  ): Promise<PasswordResetResponse> {
    return this.passwordReset.resetStaff(staffId, actor);
  }
}
