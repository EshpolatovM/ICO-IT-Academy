/**
 * Kontent 409 lari (`CONFLICT`) sabablari — `details.reason` (3.2 §2.4, B-1). Yangi `ErrorCode`
 * qo'shilmaydi.
 */
export const ContentConflictReason = {
  /** Yo'lni guruh(lar) ishlatadi yoki enrollment/progress bor — arxivlash taklif qilinadi. */
  PATH_IN_USE: 'PATH_IN_USE',
  /** Bo'lim/mavzu/darsda (ichidagilarda) progress bor — `ARCHIVED` qilish kerak. */
  HAS_PROGRESS: 'HAS_PROGRESS',
  /** Mavzuga sandiq bog'langan. */
  HAS_CHEST: 'HAS_CHEST',
  /** Shu mavzudan keyin sandiq allaqachon bor. */
  CHEST_EXISTS: 'CHEST_EXISTS',
} as const;

export type ContentConflictReason =
  (typeof ContentConflictReason)[keyof typeof ContentConflictReason];

/** Kontent 409 javobining `details` i (`reason` bo'yicha diskriminatsiyalangan). */
export type ContentConflictDetails =
  | { reason: typeof ContentConflictReason.PATH_IN_USE; groupsCount: number }
  | { reason: typeof ContentConflictReason.HAS_PROGRESS }
  | {
      reason: typeof ContentConflictReason.HAS_CHEST | typeof ContentConflictReason.CHEST_EXISTS;
      chestId: string;
    };
