import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType } from '@lms/shared';
import type { CreatedStaffResponse } from '@lms/shared';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { phoneTakenException } from '../admin-users.errors.js';
import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

import { InitialPasswordService } from './initial-password.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { ManagedStaffRole } from '../admin-users.types.js';
import type { CreateStaffDto } from '../dto/admin-users.dto.js';

/**
 * Xodim (admin yoki mentor) yaratish (docs/12 §2): telefon unique (409), parol berilmasa —
 * vaqtinchalik parol (javobda bir marta), `must_change_password = true`. Yozuv va `USER_CREATED`
 * audit — bitta tranzaksiyada. Rol ruxsati (SA → admin, SA/A → mentor) — controller `@Roles` ida.
 */
@Injectable()
export class StaffAccountCreator {
  constructor(
    private readonly accounts: UserAccountsRepository,
    private readonly passwords: InitialPasswordService,
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async create(
    role: ManagedStaffRole,
    request: CreateStaffDto,
    actor: ActorContext,
  ): Promise<CreatedStaffResponse> {
    if (await this.accounts.isPhoneTaken(request.phone)) {
      throw phoneTakenException();
    }
    const { passwordHash, temporaryPassword } = await this.passwords.prepare(request.password);
    const { id } = await this.unitOfWork.run(async () => {
      const created = await this.accounts.createStaff({
        role,
        phone: request.phone,
        firstName: request.firstName,
        lastName: request.lastName,
        passwordHash,
        createdById: actor.user.id,
      });
      await this.audit.record({
        actor: auditActor(actor.user),
        action: AuditAction.USER_CREATED,
        entityType: AuditEntityType.USER,
        entityId: created.id,
        after: {
          role,
          phone: request.phone,
          firstName: request.firstName,
          lastName: request.lastName,
          passwordGenerated: temporaryPassword !== null,
        },
        ip: actor.meta.ip,
      });
      return created;
    });
    return { id, phone: request.phone, temporaryPassword, mustChangePassword: true };
  }
}
