import { ErrorCode, Role } from '@lms/shared';
import type { ImportRowError } from '@lms/shared';

import { actorOf, fakePasswords } from '../testing/admin-users.fixtures.js';

import { StudentImportService } from './student-import.service.js';

import type { InitialPasswordService } from './initial-password.service.js';
import type {
  ParsedImportRow,
  RejectedRowGroup,
  StudentImportParser,
} from './student-import-parser.service.js';
import type { StudentImportWriter } from './student-import-writer.service.js';
import type { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';

const FE = { id: 'g1', name: 'FE-12' };

function setup(
  rows: ParsedImportRow[],
  groups = [FE],
  rowErrors: ImportRowError[] = [],
  rejectedGroups: RejectedRowGroup[] = [],
) {
  const parser = { parse: jest.fn().mockReturnValue({ rows, errors: rowErrors, rejectedGroups }) };
  const enrollment = { findActiveGroupsByNames: jest.fn().mockResolvedValue(groups) };
  const writer = {
    write: jest.fn((students: unknown[]) =>
      Promise.resolve(
        students.map((_, index) => ({
          id: `s${String(index)}`,
          studentCode: `ST-${String(10_000 + index)}`,
        })),
      ),
    ),
  };
  const service = new StudentImportService(
    parser as unknown as StudentImportParser,
    enrollment as unknown as GroupEnrollmentService,
    fakePasswords() as unknown as InitialPasswordService,
    writer as unknown as StudentImportWriter,
  );
  return { service, enrollment, writer };
}

const file = { buffer: Buffer.from('x'), size: 1, originalname: 'a.csv' };
const actor = actorOf(Role.ADMIN);
const row = (line: number, groupName?: string): ParsedImportRow => ({
  line,
  firstName: `Ism${String(line)}`,
  lastName: 'F',
  groupName,
});

describe('StudentImportService', () => {
  it('fayl yuborilmagan — 400', async () => {
    await expect(setup([]).service.import(undefined, actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });

  it('guruh nomi katta-kichik harf farqisiz; natijada vaqtinchalik parollar (bir marta)', async () => {
    const { service, enrollment, writer } = setup([row(2, 'fe-12'), row(3), row(4, 'FE-12')]);

    const result = await service.import(file, actor);

    expect(enrollment.findActiveGroupsByNames).toHaveBeenCalledWith(['fe-12', 'FE-12']);
    expect(writer.write).toHaveBeenCalledWith(
      [
        { firstName: 'Ism2', lastName: 'F', group: FE, passwordHash: 'hash(Temp1abc)' },
        { firstName: 'Ism3', lastName: 'F', group: null, passwordHash: 'hash(Temp2abc)' },
        { firstName: 'Ism4', lastName: 'F', group: FE, passwordHash: 'hash(Temp3abc)' },
      ],
      actor,
    );
    expect(result.count).toBe(3);
    expect(result.students[0]).toEqual({
      id: 's0',
      studentCode: 'ST-10000',
      firstName: 'Ism2',
      lastName: 'F',
      groupName: 'FE-12',
      temporaryPassword: 'Temp1abc',
    });
  });

  it("topilmagan va ko'p ma'noli guruh nomlari — qator xatolari, hech narsa yozilmaydi", async () => {
    const twins = [FE, { id: 'g2', name: 'Dup' }, { id: 'g3', name: 'dup' }];
    const { service, writer } = setup([row(2, 'Yoq'), row(3, 'DUP'), row(4, 'FE-12')], twins);

    await expect(service.import(file, actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [
        { row: 2, field: 'groupName', message: expect.stringContaining('topilmadi') as string },
        { row: 3, field: 'groupName', message: expect.stringContaining('bir nechta') as string },
      ],
    });
    expect(writer.write).not.toHaveBeenCalled();
  });

  it("qator va guruh xatolari bitta 400 javobda, qator tartibida (parser xatosi guruh tekshiruvini to'xtatmaydi)", async () => {
    const lastNameError = { row: 2, field: 'lastName', message: 'Majburiy' };
    const { service, writer, enrollment } = setup([row(3, 'YoqGuruh123')], [FE], [lastNameError]);

    await expect(service.import(file, actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [lastNameError, { row: 3, field: 'groupName' }],
    });
    expect(enrollment.findActiveGroupsByNames).toHaveBeenCalledWith(['YoqGuruh123']);
    expect(writer.write).not.toHaveBeenCalled();
  });

  it('rad etilgan qatorning guruh nomi ham tekshiriladi: bir qatorda maydon va guruh xatosi, barqaror tartib', async () => {
    const lastNameError = { row: 2, field: 'lastName', message: 'Majburiy' };
    const firstNameError = { row: 4, field: 'firstName', message: 'Majburiy' };
    const { service, writer, enrollment } = setup(
      [row(3, 'Yoq3')],
      [FE],
      [lastNameError, firstNameError],
      [
        { line: 2, groupName: 'Yoq2' },
        { line: 4, groupName: 'fe-12' },
      ],
    );

    await expect(service.import(file, actor)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [
        lastNameError,
        { row: 2, field: 'groupName' },
        { row: 3, field: 'groupName' },
        firstNameError,
      ],
    });
    expect(enrollment.findActiveGroupsByNames).toHaveBeenCalledWith(['Yoq3', 'Yoq2', 'fe-12']);
    expect(writer.write).not.toHaveBeenCalled();
  });
});
