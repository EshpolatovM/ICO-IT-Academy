import { Injectable } from '@nestjs/common';

import type { GroupRef, ImportRowError, StudentImportResult } from '@lms/shared';

import { GroupEnrollmentService } from '../../groups/services/group-enrollment.service.js';
import { fileError, importValidationException } from '../student-import.errors.js';

import { InitialPasswordService } from './initial-password.service.js';
import { StudentImportParser } from './student-import-parser.service.js';
import { StudentImportWriter } from './student-import-writer.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { UploadedCsvFile } from '../admin-users.types.js';
import type { PreparedImportStudent } from './student-import-writer.service.js';

const GROUP_NAME_FIELD = 'groupName';

/** Guruh nomi tekshiriladigan qator (to'g'ri yoki parser rad etgan). */
interface RowGroupName {
  line: number;
  groupName?: string;
}

interface ResolvedGroups {
  /** Qator raqami → guruh (guruh nomi bo'lmagan qatorlar yo'q). */
  byLine: Map<number, GroupRef>;
  errors: ImportRowError[];
}

function nameKey(name: string): string {
  return name.toLowerCase();
}

/**
 * Studentlarni CSV orqali import qilish (S-21, docs/12 §2): avval TO'LIQ validatsiya (fayl,
 * qatorlar, guruh nomlari — faol guruh aniq bitta bo'lishi shart; rad etilgan qatorlarniki ham);
 * qator va guruh xatolari birlashtirilib (qator tartibida, qator ichida maydon xatolaridan keyin
 * guruh) bitta 400 javobda qaytadi, hech narsa yaratilmaydi. Aks holda hammasi bitta tranzaksiyada
 * yaratiladi (guruh shu orada arxivlansa — 409 `GROUP_ARCHIVED`, writer) va javobda har bir
 * student vaqtinchalik paroli bilan BIR MARTA qaytadi.
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
    const { rows, errors, rejectedGroups } = this.parser.parse(file.buffer);
    const { byLine, errors: groupErrors } = await this.resolveGroups([...rows, ...rejectedGroups]);
    const allErrors = [...errors, ...groupErrors].sort((a, b) => a.row - b.row);
    if (allErrors.length > 0) {
      throw importValidationException(allErrors);
    }
    const passwords = await Promise.all(rows.map(() => this.passwords.generate()));
    const prepared = rows.map((row, index): PreparedImportStudent => ({
      firstName: row.firstName,
      lastName: row.lastName,
      group: byLine.get(row.line) ?? null,
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

  /** Guruh nomli qatorlar uchun guruh; topilmagan/ko'p ma'noli nom — qator xatosi. */
  private async resolveGroups(rows: readonly RowGroupName[]): Promise<ResolvedGroups> {
    const names = [...new Set(rows.flatMap((row) => (row.groupName ? [row.groupName] : [])))];
    const found = await this.enrollment.findActiveGroupsByNames(names);
    const byName = new Map<string, GroupRef[]>();
    for (const group of found) {
      byName.set(nameKey(group.name), [...(byName.get(nameKey(group.name)) ?? []), group]);
    }
    const resolved: ResolvedGroups = { byLine: new Map(), errors: [] };
    for (const { line, groupName } of rows) {
      const matches = groupName ? (byName.get(nameKey(groupName)) ?? []) : [];
      if (groupName && matches.length !== 1) {
        resolved.errors.push({
          row: line,
          field: GROUP_NAME_FIELD,
          message: groupError(matches.length),
        });
      } else if (matches[0]) {
        resolved.byLine.set(line, matches[0]);
      }
    }
    return resolved;
  }
}

function groupError(matches: number): string {
  return matches === 0
    ? 'Bunday nomli faol guruh topilmadi'
    : "Bu nomli faol guruh bir nechta — nomni aniqlashtiring yoki studentni keyin guruhga qo'shing";
}
