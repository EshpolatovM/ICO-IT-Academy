import { Injectable } from '@nestjs/common';

import {
  STUDENT_IMPORT_REQUIRED_COLUMNS,
  StudentImportColumn,
  studentImportRowSchema,
} from '@lms/shared';
import type { ImportRowError, StudentImportRow } from '@lms/shared';

import { AppConfigService } from '../../../common/config/app-config.service.js';
import { CsvParseError, detectCsvDelimiter, parseCsv } from '../../../common/csv/csv-parser.js';
import { toFieldErrors } from '../../../common/pipes/zod-validation.pipe.js';
import {
  FILE_FIELD,
  fileError,
  HEADER_ROW,
  importValidationException,
} from '../student-import.errors.js';

import type { CsvRecord } from '../../../common/csv/csv-parser.js';

export interface ParsedImportRow extends StudentImportRow {
  /** Fayldagi qator raqami (xatolar va natija tartibi uchun). */
  line: number;
}

type ColumnIndexes = Partial<Record<StudentImportColumn, number>>;

const KNOWN_COLUMNS = new Map<string, StudentImportColumn>(
  Object.values(StudentImportColumn).map((column) => [column.toLowerCase(), column]),
);

function decodeUtf8(content: Buffer): string {
  try {
    // `fatal` — noto'g'ri UTF-8 xato beradi; BOM (Excel) olib tashlanadi.
    return new TextDecoder('utf-8', { fatal: true }).decode(content);
  } catch {
    throw fileError("Fayl UTF-8 kodlashdagi CSV matn bo'lishi kerak");
  }
}

function readRecords(text: string): CsvRecord[] {
  try {
    return parseCsv(text, detectCsvDelimiter(text));
  } catch (error) {
    if (error instanceof CsvParseError) {
      throw importValidationException([
        { row: error.line, field: FILE_FIELD, message: error.message },
      ]);
    }
    throw error;
  }
}

/** Sarlavha → ustun indekslari (nomi bo'yicha, katta-kichik harf farqisiz). */
function mapHeader(header: readonly string[]): ColumnIndexes {
  const indexes: ColumnIndexes = {};
  const errors: ImportRowError[] = [];
  header.forEach((raw, index) => {
    const column = KNOWN_COLUMNS.get(raw.trim().toLowerCase());
    if (!column) {
      errors.push({ row: HEADER_ROW, field: raw, message: "Noma'lum ustun" });
    } else if (indexes[column] !== undefined) {
      errors.push({ row: HEADER_ROW, field: column, message: 'Ustun takrorlangan' });
    } else {
      indexes[column] = index;
    }
  });
  for (const column of STUDENT_IMPORT_REQUIRED_COLUMNS) {
    if (indexes[column] === undefined) {
      errors.push({ row: HEADER_ROW, field: column, message: "Majburiy ustun yo'q" });
    }
  }
  if (errors.length > 0) {
    throw importValidationException(errors);
  }
  return indexes;
}

function readRow(
  record: CsvRecord,
  indexes: ColumnIndexes,
  width: number,
): ParsedImportRow | ImportRowError[] {
  if (record.fields.length > width) {
    return [{ row: record.line, field: FILE_FIELD, message: "Ustunlar soni sarlavhadagidan ko'p" }];
  }
  const raw = Object.fromEntries(
    Object.entries(indexes).map(([column, index]) => [column, record.fields[index] ?? '']),
  );
  const parsed = studentImportRowSchema.safeParse(raw);
  if (!parsed.success) {
    return toFieldErrors(parsed.error).map((issue) => ({ ...issue, row: record.line }));
  }
  return { ...parsed.data, line: record.line };
}

/**
 * CSV import faylini o'qish va TO'LIQ validatsiya (S-21, docs/12 §2): UTF-8, birinchi qator —
 * sarlavha (`firstName,lastName[,groupName]`, `,` yoki `;`), qatorlar soni chegarasi (env).
 * Birorta xato bo'lsa — barcha xatolar qator raqamlari bilan bitta 400 javobda.
 */
@Injectable()
export class StudentImportParser {
  constructor(private readonly config: AppConfigService) {}

  parse(content: Buffer): ParsedImportRow[] {
    const [header, ...records] = readRecords(decodeUtf8(content));
    if (!header) {
      throw fileError("Fayl bo'sh");
    }
    const indexes = mapHeader(header.fields);
    this.assertRowCount(records.length);
    const rows: ParsedImportRow[] = [];
    const errors: ImportRowError[] = [];
    for (const record of records) {
      const result = readRow(record, indexes, header.fields.length);
      if (Array.isArray(result)) {
        errors.push(...result);
      } else {
        rows.push(result);
      }
    }
    if (errors.length > 0) {
      throw importValidationException(errors);
    }
    return rows;
  }

  private assertRowCount(count: number): void {
    const maxRows = this.config.get('STUDENT_IMPORT_MAX_ROWS');
    if (count === 0) {
      throw fileError("Faylda sarlavhadan keyin ma'lumot qatorlari yo'q");
    }
    if (count > maxRows) {
      throw fileError(`Bitta importda ko'pi bilan ${maxRows} ta qator bo'lishi mumkin`);
    }
  }
}
