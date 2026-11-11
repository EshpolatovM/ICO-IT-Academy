import { Inject, Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, ErrorCode, Role } from '@lms/shared';
import type { AccountRole, PasswordResetResponse } from '@lms/shared';

import { AppException } from '../../../common/exceptions/app.exception.js';
import { PASSWORD_HASHER } from '../../../common/security/password-hasher.interface.js';
import { generateTemporaryPassword } from '../../../common/security/temporary-password.generator.js';
import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { TokenVersionService } from '../../auth/services/token-version.service.js';
import { UsersRepository } from '../../users/repositories/users.repository.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { PasswordHasher } from '../../../common/security/password-hasher.interface.js';
import type { UserAuthRecord } from '../../users/users.types.js';

/**
 * Xodim parolini kim tiklay oladi (docs/02 §4.3, S-14 ✅ A; docs/12 §2):
 * ADMIN → faqat MENTOR; SUPER_ADMIN → ADMIN va MENTOR. Super admin parolini API orqali hech kim.
 */
const STAFF_RESET_TARGETS: Readonly<Partial<Record<Role, readonly AccountRole[]>>> = {
  [Role.SUPER_ADMIN]: [Role.ADMIN, Role.MENTOR],
  [Role.ADMIN]: [Role.MENTOR],
};

/**
 * Parolni tiklash (docs/02 §4.3): 10 belgili kriptografik tasodifiy vaqtinchalik parol,
 * `must_change_password = true`, `token_version++` (Redis kesh yangilanadi), barcha refresh
 * tokenlar bekor, audit. Vaqtinchalik parol javobda faqat bir marta qaytadi, hech qayerda saqlanmaydi.
 * Parol yangilash va audit — bitta tranzaksiyada (`UnitOfWork`); Argon2 hash — undan oldin.
 */
@Injectable()
export class PasswordResetService {
  constructor(
    private readonly users: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    private readonly tokenVersions: TokenVersionService,
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  /** Scope (`@StudentScope`) controller'da; bu yerda — student mavjudligi (aks holda 404). */
  async resetStudent(studentId: string, actor: ActorContext): Promise<PasswordResetResponse> {
    const target = await this.users.findAuthById(studentId);
    if (target?.role !== Role.STUDENT) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    return this.reset(target, actor);
  }

  async resetStaff(staffId: string, actor: ActorContext): Promise<PasswordResetResponse> {
    if (staffId === actor.user.id) {
      throw new AppException({
        code: ErrorCode.FORBIDDEN,
        message: "O'z parolingizni bu yerda tiklab bo'lmaydi — parolni almashtirishdan foydalaning",
      });
    }
    const target = await this.users.findAuthById(staffId);
    if (!target || target.role === Role.STUDENT) {
      throw new AppException({ code: ErrorCode.NOT_FOUND });
    }
    if (!STAFF_RESET_TARGETS[actor.user.role]?.includes(target.role)) {
      throw new AppException({ code: ErrorCode.FORBIDDEN });
    }
    return this.reset(target, actor);
  }

  private async reset(target: UserAuthRecord, actor: ActorContext): Promise<PasswordResetResponse> {
    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await this.hasher.hash(temporaryPassword);
    const { tokenVersion } = await this.unitOfWork.run(async () => {
      const result = await this.users.resetPassword(target.id, {
        passwordHash,
        revokedAt: new Date(),
      });
      await this.audit.record({
        actor: auditActor(actor.user),
        action: AuditAction.PASSWORD_RESET,
        entityType: AuditEntityType.USER,
        entityId: target.id,
        before: { role: target.role, mustChangePassword: target.mustChangePassword },
        after: { role: target.role, mustChangePassword: true },
        ip: actor.meta.ip,
      });
      return result;
    });
    await this.tokenVersions.onVersionChanged(target.id, tokenVersion);
    return { temporaryPassword };
  }
}
