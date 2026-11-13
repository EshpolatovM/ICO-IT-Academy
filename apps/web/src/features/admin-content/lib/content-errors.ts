import { ErrorCode } from '@lms/shared';

import { errorMessage, isApiError } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

const REASON_TEXT: Record<ContentConflictReason, string> = {
  [ContentConflictReason.PATH_IN_USE]:
    "Yo'l ishlatilmoqda (guruhlar yoki studentlar progressi bor). O'chirish o'rniga yashiring.",
  [ContentConflictReason.HAS_PROGRESS]:
    'Bu yerda studentlar progressi bor. O\'chirish o\'rniga holatini "Arxivlangan" qiling.',
  [ContentConflictReason.HAS_CHEST]:
    "Mavzuga sandiq bog'langan. Avval sandiqni o'chiring yoki boshqa mavzuga bog'lang.",
  [ContentConflictReason.CHEST_EXISTS]: 'Bu mavzudan keyin sandiq allaqachon bor.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isConflictReason(value: unknown): value is ContentConflictReason {
  return typeof value === 'string' && value in REASON_TEXT;
}

/** 409 `CONFLICT` `details.reason` (§2.4) yoki `undefined`. */
export function conflictReason(error: unknown): ContentConflictReason | undefined {
  if (!isApiError(error) || error.code !== ErrorCode.CONFLICT || !isRecord(error.details)) {
    return undefined;
  }
  const { reason } = error.details;
  return isConflictReason(reason) ? reason : undefined;
}

function groupsCountOf(error: unknown): number | undefined {
  if (!isApiError(error) || !isRecord(error.details)) {
    return undefined;
  }
  const { groupsCount } = error.details;
  return typeof groupsCount === 'number' ? groupsCount : undefined;
}

/** Kontent amali xatosi matni: 409 sababi tushunarli tilda, qolgani — server xabari. */
export function contentErrorText(error: unknown): string {
  const reason = conflictReason(error);
  if (reason === undefined) {
    return errorMessage(error);
  }
  const groupsCount = groupsCountOf(error);
  const text = REASON_TEXT[reason];
  return groupsCount !== undefined && groupsCount > 0
    ? `${text} Guruhlar soni: ${String(groupsCount)}.`
    : text;
}
