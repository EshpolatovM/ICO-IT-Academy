import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, Role } from '@lms/shared';
import type { CreatedStudentResponse } from '@lms/shared';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

import { InitialPasswordService } from './initial-password.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { CreateStudentDto } from '../dto/admin-users.dto.js';

const GROUP_ID_FIELD = 'groupId';

/**
 * Student yaratish (docs/12 §2, docs/02 §2): kod `student_code_seq` dan, parol berilmasa —
 * vaqtinchalik (javobda bir marta), `must_change_password = true`. `groupId` berilsa — guruh
 * faol bo'lishi shart (400), student faol a'zo bo'ladi (S-02; boshqa faol guruh — 409).
 * Guruh tekshiruvi, yaratish, a'zolik va `USER_CREATED` audit — bitta tranzaksiyada.
 */
@Injectable()
export class StudentAccountCreator {
  constructor(
    private readonly accounts: UserAccountsRepository,
    private readonly enrollment: GroupEnrollmentService,
    private readonly passwords: InitialPasswordService,
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async create(request: CreateStudentDto, actor: ActorContext): Promise<CreatedStudentResponse> {
    const { passwordHash, temporaryPassword } = await this.passwords.prepare(request.password);
    const created = await this.unitOfWork.run(async () => {
      const group = request.groupId
        ? await this.enrollment.requireActiveGroup(request.groupId, GROUP_ID_FIELD)
        : null;
      const student = await this.accounts.createStudent({
        firstName: request.firstName,
        lastName: request.lastName,
        passwordHash,
        createdById: actor.user.id,
      });
      if (group) {
        await this.enrollment.enroll({ groupId: group.id, studentId: student.id });
      }
      await this.audit.record({
        actor: auditActor(actor.user),
        action: AuditAction.USER_CREATED,
        entityType: AuditEntityType.USER,
        entityId: student.id,
        after: {
          role: Role.STUDENT,
          studentCode: student.studentCode,
          firstName: request.firstName,
          lastName: request.lastName,
          groupId: group?.id ?? null,
          passwordGenerated: temporaryPassword !== null,
        },
        ip: actor.meta.ip,
      });
      return student;
    });
    return { ...created, temporaryPassword, mustChangePassword: true };
  }
}
