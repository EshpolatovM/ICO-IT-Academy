import { AuditAction, AuditEntityType, ErrorCode, Role } from '@lms/shared';

import { actorOf, fakeAudit, fakeUnitOfWork } from '../testing/admin-users.fixtures.js';

import { StudentImportWriter } from './student-import-writer.service.js';

import type { PreparedImportStudent } from './student-import-writer.service.js';
import type { AppException } from '../../../common/exceptions/app.exception.js';
import type { AuditEntry } from '../../audit/audit.types.js';
import type { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import type { UserAccountsRepository } from '../repositories/user-accounts.repository.js';

const FE = { id: 'g1', name: 'FE' };

const STUDENTS: PreparedImportStudent[] = [
  { firstName: 'A', lastName: 'B', group: FE, passwordHash: 'h1' },
  { firstName: 'C', lastName: 'D', group: null, passwordHash: 'h2' },
  { firstName: 'E', lastName: 'F', group: FE, passwordHash: 'h3' },
];

function setup() {
  const calls: string[] = [];
  const track =
    <T>(name: string, value: T) =>
    () => {
      calls.push(name);
      return Promise.resolve(value);
    };
  const accounts = {
    createStudents: jest.fn(
      track('createStudents', [
        { id: 's1', studentCode: 'ST-1' },
        { id: 's2', studentCode: 'ST-2' },
        { id: 's3', studentCode: 'ST-3' },
      ]),
    ),
  };
  const enrollment = {
    requireGroupsStillActive: jest.fn(track('requireGroupsStillActive', undefined)),
    enrollNewStudents: jest.fn(track('enrollNewStudents', undefined)),
    refreshMentorScopes: jest.fn().mockResolvedValue(undefined),
  };
  const { audit, asAudit } = fakeAudit();
  const { unitOfWork, asUnitOfWork } = fakeUnitOfWork();
  const writer = new StudentImportWriter(
    accounts as unknown as UserAccountsRepository,
    enrollment as unknown as GroupEnrollmentService,
    asAudit,
    asUnitOfWork,
  );
  return { writer, accounts, enrollment, audit, unitOfWork, calls };
}

describe('StudentImportWriter', () => {
  it("bitta tranzaksiya: guruhlar qulfi, studentlar, a'zoliklar, USER_CREATED + STUDENTS_IMPORTED", async () => {
    const { writer, accounts, enrollment, audit, unitOfWork, calls } = setup();

    const created = await writer.write(STUDENTS, actorOf(Role.ADMIN));

    expect(created).toHaveLength(3);
    expect(unitOfWork.run).toHaveBeenCalledTimes(1);
    expect(enrollment.requireGroupsStillActive).toHaveBeenCalledWith([FE, FE]);
    expect(calls).toEqual(['requireGroupsStillActive', 'createStudents', 'enrollNewStudents']);
    expect(accounts.createStudents).toHaveBeenCalledWith([
      { firstName: 'A', lastName: 'B', passwordHash: 'h1', createdById: 'actor' },
      { firstName: 'C', lastName: 'D', passwordHash: 'h2', createdById: 'actor' },
      { firstName: 'E', lastName: 'F', passwordHash: 'h3', createdById: 'actor' },
    ]);
    expect(enrollment.enrollNewStudents).toHaveBeenCalledWith([
      { groupId: 'g1', studentId: 's1' },
      { groupId: 'g1', studentId: 's3' },
    ]);
    expect(enrollment.refreshMentorScopes).toHaveBeenCalledWith(['g1']);
    const [[entries]] = audit.recordMany.mock.calls as [[AuditEntry[]]];
    expect(entries.map((entry) => entry.action)).toEqual([
      AuditAction.USER_CREATED,
      AuditAction.USER_CREATED,
      AuditAction.USER_CREATED,
      AuditAction.STUDENTS_IMPORTED,
    ]);
    expect(entries[3]).toMatchObject({
      entityType: AuditEntityType.STUDENT_IMPORT,
      after: { count: 3, studentIds: ['s1', 's2', 's3'] },
    });
    expect(JSON.stringify(entries)).not.toMatch(/h1|h2|h3/);
  });

  it('guruh validatsiyadan keyin arxivlangan — 409 GROUP_ARCHIVED, hech narsa yozilmaydi', async () => {
    const { writer, accounts, enrollment, audit } = setup();
    const archived = { code: ErrorCode.GROUP_ARCHIVED } as unknown as AppException;
    enrollment.requireGroupsStillActive.mockRejectedValue(archived);

    await expect(writer.write(STUDENTS, actorOf(Role.ADMIN))).rejects.toBe(archived);

    expect(accounts.createStudents).not.toHaveBeenCalled();
    expect(enrollment.enrollNewStudents).not.toHaveBeenCalled();
    expect(audit.recordMany).not.toHaveBeenCalled();
    expect(enrollment.refreshMentorScopes).not.toHaveBeenCalled();
  });
});
