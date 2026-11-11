import {
  STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES,
  STUDENT_IMPORT_DEFAULT_MAX_ROWS,
} from '@lms/shared';

const BYTES_PER_KIB = 1024;
const BYTES_PER_MIB = BYTES_PER_KIB * BYTES_PER_KIB;
const MIB_FRACTION_DIGITS = 1;

const mibFormat = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: MIB_FRACTION_DIGITS });

/** Baytlar → "1 MiB" ko'rinishi. */
export function formatMebibytes(bytes: number): string {
  return `${mibFormat.format(bytes / BYTES_PER_MIB)} MiB`;
}

/** CSV importning standart chegaralari (server env bilan boshqacha bo'lishi mumkin, docs/12 §2.1). */
export const IMPORT_LIMITS_TEXT = {
  fileSize: formatMebibytes(STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES),
  rows: String(STUDENT_IMPORT_DEFAULT_MAX_ROWS),
} as const;

/** Klientdagi oldindan tekshiruv: fayl standart hajm chegarasidan kattami. */
export function exceedsDefaultImportSize(file: File): boolean {
  return file.size > STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES;
}
