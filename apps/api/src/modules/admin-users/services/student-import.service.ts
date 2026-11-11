import { Injectable } from '@nestjs/common';

import type { GroupRef, ImportRowError, StudentImportResult } from '@lms/shared';

import { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import { fileError, importValidationException } from '../student-import.errors.js';

import { InitialPasswordService } from './initial-password.service.js';
import { StudentImportParser } from './student-import-parser.service.js';
import { StudentImportWriter } from './student-import-writer.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { UploadedCsvFile } from '../admin-users.types.js';
import type { ParsedImportRow } from './student-import-parser.service.js';
import type { PreparedImportStudent } from './student-import-writer.service.js';

const GROUP_NAME_FIELD = 'groupName';

function nameKey(name: string): string {
  return name.toLowerCase();
}

/**
 * Studentlarni CSV orqali import qilish (S-21, docs/12 §2): avval TO'LIQ validatsiya (fayl,
 * qatorlar, guruh nomlari — faol guruh aniq bitta bo'lishi shart); birorta xato bo'lsa hech narsa
 * yaratilmaydi (400, qator raqamlari bilan). Aks holda hammasi bitta tranzaksiyada yaratiladi va
 * javobda har bir student vaqtinchalik paroli bilan BIR MARTA qaytadi.
 */
@Injectable()
export class StudentImportService {
  constructor(
    private readonly parser: StudentImportParser,
    private readonly enrollment: GroupEnrollmentService,
    private readonly passwords: InitialPasswordService,
    private readonly writer: StudentImportWriter,
  ) {}

  async import(
    file: UploadedCsvFile | undefined,
    actor: ActorContext,
  ): Promise<StudentImportResult> {
    if (!file) {
      throw fileError('CSV fayl yuborilmagan');
    }
    const rows = this.parser.parse(file.buffer);
    const groups = await this.resolveGroups(rows);
    const passwords = await Promise.all(rows.map(() => this.passwords.generate()));
    const prepared = rows.map((row, index): PreparedImportStudent => ({
      firstName: row.firstName,
      lastName: row.lastName,
      group: groups[index] ?? null,
      passwordHash: passwords[index]?.passwordHash ?? '',
    }));
    const created = await this.writer.write(prepared, actor);
    const students = created.map((student, index) => ({
      ...student,
      firstName: prepared[index]?.firstName ?? '',
      lastName: prepared[index]?.lastName ?? '',
      groupName: prepared[index]?.group?.name ?? null,
      temporaryPassword: passwords[index]?.temporaryPassword ?? '',
    }));
    return { count: students.length, students };
  }

  /** Har bir qator uchun guruh (yoki `null`); topilmagan/ko'p ma'noli nom — qator xatosi. */
  private async resolveGroups(rows: readonly ParsedImportRow[]): Promise<(GroupRef | null)[]> {
    const names = [...new Set(rows.flatMap((row) => (row.groupName ? [row.groupName] : [])))];
    const found = await this.enrollment.findActiveGroupsByNames(names);
    const byName = new Map<string, GroupRef[]>();
    for (const group of found) {
      byName.set(nameKey(group.name), [...(byName.get(nameKey(group.name)) ?? []), group]);
    }
    const errors: ImportRowError[] = [];
    const resolved = rows.map((row) => {
      if (!row.groupName) {
        return null;
      }
      const matches = byName.get(nameKey(row.groupName)) ?? [];
      if (matches.length !== 1) {
        errors.push({
          row: row.line,
          field: GROUP_NAME_FIELD,
          message: groupError(matches.length),
        });
      }
      return matches[0] ?? null;
    });
    if (errors.length > 0) {
      throw importValidationException(errors);
    }
    return resolved;
  }
}

function groupError(matches: number): string {
  return matches === 0
    ? 'Bunday nomli faol guruh topilmadi'
    : "Bu nomli faol guruh bir nechta — nomni aniqlashtiring yoki studentni keyin guruhga qo'shing";
}
