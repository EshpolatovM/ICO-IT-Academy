import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, Role } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { auditActor } from '../../audit/audit-actor.js';
import { AuditService } from '../../audit/services/audit.service.js';
import { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { AuditEntry } from '../../audit/audit.types.js';
import type { CreatedStudentRecord } from '../admin-users.types.js';

/** Validatsiyadan o'tgan, paroli hash qilingan import qatori. */
export interface PreparedImportStudent {
  firstName: string;
  lastName: string;
  group: GroupRef | null;
  passwordHash: string;
}

/**
 * Import natijasini yozish — hammasi yoki hech narsa (bitta tranzaksiya, S-21): studentlar (kodlar
 * bitta so'rovda), guruh a'zoliklari, har bir student uchun `USER_CREATED` va partiya uchun
 * `STUDENTS_IMPORTED` audit. Natija kirish tartibida.
 */
@Injectable()
export class StudentImportWriter {
  constructor(
    private readonly accounts: UserAccountsRepository,
    private readonly enrollment: GroupEnrollmentService,
    private readonly audit: AuditService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  write(
    students: readonly PreparedImportStudent[],
    actor: ActorContext,
  ): Promise<CreatedStudentRecord[]> {
    return this.unitOfWork.run(async () => {
      const created = await this.accounts.createStudents(
        students.map(({ firstName, lastName, passwordHash }) => ({
          firstName,
          lastName,
          passwordHash,
          createdById: actor.user.id,
        })),
      );
      await this.enrollment.enrollNewStudents(
        created.flatMap((student, index) => {
          const group = students[index]?.group;
          return group ? [{ groupId: group.id, studentId: student.id }] : [];
        }),
      );
      await this.audit.recordMany(this.auditEntries(students, created, actor));
      return created;
    });
  }

  private auditEntries(
    students: readonly PreparedImportStudent[],
    created: readonly CreatedStudentRecord[],
    actor: ActorContext,
  ): AuditEntry[] {
    const base = { actor: auditActor(actor.user), ip: actor.meta.ip };
    const perStudent = created.map((student, index): AuditEntry => ({
      ...base,
      action: AuditAction.USER_CREATED,
      entityType: AuditEntityType.USER,
      entityId: student.id,
      after: {
        role: Role.STUDENT,
        studentCode: student.studentCode,
        firstName: students[index]?.firstName,
        lastName: students[index]?.lastName,
        groupId: students[index]?.group?.id ?? null,
        passwordGenerated: true,
        imported: true,
      },
    }));
    const batch: AuditEntry = {
      ...base,
      action: AuditAction.STUDENTS_IMPORTED,
      entityType: AuditEntityType.STUDENT_IMPORT,
      entityId: randomUUID(),
      after: { count: created.length, studentIds: created.map((student) => student.id) },
    };
    return [...perStudent, batch];
  }
}
