import { ErrorCode } from '@lms/shared';

import type { ComboboxOption } from '@/components/ui';
import { isApiError, UNKNOWN_ERROR_MESSAGE } from '@/lib/api';

export const GROUP_ARCHIVED_MESSAGE = "Arxivlangan guruhga qo'shib bo'lmaydi";
const ALREADY_IN_GROUP_PREFIX = 'Allaqachon boshqa faol guruhda';
const STUDENT_ID_FIELD_RE = /^studentIds\.(\d+)$/;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/** 409 `STUDENT_ALREADY_IN_GROUP` → `details.studentIds`. */
function conflictingStudentIds(details: unknown): string[] {
  if (typeof details !== 'object' || details === null || !('studentIds' in details)) {
    return [];
  }
  return isStringArray(details.studentIds) ? details.studentIds : [];
}

function labelOf(id: string, selected: readonly ComboboxOption[]): string {
  return selected.find((option) => option.value === id)?.label ?? id;
}

/** 400 `details[].field = studentIds.<i>` → "Ism: xabar" (i — yuborilgan ro'yxatdagi tartib). */
function fieldErrorsText(
  fieldErrors: readonly { field: string; message: string }[],
  selected: readonly ComboboxOption[],
): string | null {
  const lines = fieldErrors.flatMap(({ field, message }) => {
    const match = STUDENT_ID_FIELD_RE.exec(field);
    if (match === null) {
      return field === 'studentIds' ? [message] : [];
    }
    const option = selected[Number(match[1])];
    return [option === undefined ? message : `${option.label}: ${message}`];
  });
  return lines.length > 0 ? lines.join('; ') : null;
}

/**
 * "Student qo'shish" xatosi (docs/12 §2.2) — Combobox maydoni ostida ko'rinadi:
 * 409 `STUDENT_ALREADY_IN_GROUP` — studentlar nomi bilan; 409 `GROUP_ARCHIVED`; 400 maydon xatolari.
 */
export function addMembersErrorText(error: unknown, selected: readonly ComboboxOption[]): string {
  if (!isApiError(error)) {
    return UNKNOWN_ERROR_MESSAGE;
  }
  if (error.code === ErrorCode.STUDENT_ALREADY_IN_GROUP) {
    const names = conflictingStudentIds(error.details).map((id) => labelOf(id, selected));
    return names.length > 0 ? `${ALREADY_IN_GROUP_PREFIX}: ${names.join(', ')}` : error.message;
  }
  if (error.code === ErrorCode.GROUP_ARCHIVED) {
    return GROUP_ARCHIVED_MESSAGE;
  }
  return fieldErrorsText(error.fieldErrors, selected) ?? error.message;
}

/** `PUT .../mentor` xatosi: 400 `mentorId` maydon xabari yoki umumiy xabar. */
export function mentorErrorText(error: unknown): string {
  if (isApiError(error)) {
    const detail = error.fieldErrors.find(({ field }) => field === 'mentorId');
    return detail?.message ?? error.message;
  }
  return UNKNOWN_ERROR_MESSAGE;
}
