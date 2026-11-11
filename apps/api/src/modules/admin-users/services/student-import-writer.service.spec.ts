import { AuditAction, AuditEntityType, Role } from '@lms/shared';

import { actorOf, fakeAudit, fakeUnitOfWork } from '../testing/admin-users.fixtures.js';

import { StudentImportWriter } from './student-import-writer.service.js';

import type { AuditEntry } from '../../audit/audit.types.js';
import type { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

describe('StudentImportWriter', () => {
  it("bitta tranzaksiya: studentlar, a'zoliklar, USER_CREATED har biriga + STUDENTS_IMPORTED", async () => {
    const accounts = {
      createStudents: jest.fn().mockResolvedValue([
        { id: 's1', studentCode: 'ST-1' },
        { id: 's2', studentCode: 'ST-2' },
      ]),
    };
    const enrollment = { enrollNewStudents: jest.fn().mockResolvedValue(undefined) };
    const { audit, asAudit } = fakeAudit();
    const { unitOfWork, asUnitOfWork } = fakeUnitOfWork();
    const writer = new StudentImportWriter(
      accounts as unknown as UserAccountsRepository,
      enrollment as unknown as GroupEnrollmentService,
      asAudit,
      asUnitOfWork,
    );

    const created = await writer.write(
      [
        { firstName: 'A', lastName: 'B', group: { id: 'g1', name: 'FE' }, passwordHash: 'h1' },
        { firstName: 'C', lastName: 'D', group: null, passwordHash: 'h2' },
      ],
      actorOf(Role.ADMIN),
    );

    expect(created).toHaveLength(2);
    expect(unitOfWork.run).toHaveBeenCalledTimes(1);
    expect(accounts.createStudents).toHaveBeenCalledWith([
      { firstName: 'A', lastName: 'B', passwordHash: 'h1', createdById: 'actor' },
      { firstName: 'C', lastName: 'D', passwordHash: 'h2', createdById: 'actor' },
    ]);
    expect(enrollment.enrollNewStudents).toHaveBeenCalledWith([{ groupId: 'g1', studentId: 's1' }]);
    const [[entries]] = audit.recordMany.mock.calls as [[AuditEntry[]]];
    expect(entries.map((entry) => entry.action)).toEqual([
      AuditAction.USER_CREATED,
      AuditAction.USER_CREATED,
      AuditAction.STUDENTS_IMPORTED,
    ]);
    expect(entries[2]).toMatchObject({
      entityType: AuditEntityType.STUDENT_IMPORT,
      after: { count: 2, studentIds: ['s1', 's2'] },
    });
    expect(JSON.stringify(entries)).not.toMatch(/h1|h2/);
  });
});
