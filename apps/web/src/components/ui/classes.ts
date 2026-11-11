/** Komponentlar orasida umumiy klass bo'laklari (DRY). Faqat token'lar asosidagi klasslar. */

/** Klaviatura fokusi uchun ko'rinadigan halqa. */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/** Ko'rinmas `peer` element (masalan fayl input) fokuslanganda yonidagi ko'rinadigan elementga halqa. */
export const peerFocusRing =
  'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring';

/** Kiritish maydonlari (Input, Select, Textarea) uchun umumiy ko'rinish. */
export const fieldBase =
  'block w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-disabled disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled';

/** Xato holatidagi maydon chegarasi. */
export const fieldInvalid = 'border-danger';

/** Holat ohanglari (Alert, Badge): chegara + och fon + matn rangi. */
export type StatusTone = 'info' | 'success' | 'warning' | 'danger';

export const toneClasses: Record<StatusTone, string> = {
  info: 'border-info bg-info-bg text-info',
  success: 'border-success bg-success-bg text-success',
  warning: 'border-warning bg-warning-bg text-warning',
  danger: 'border-danger bg-danger-bg text-danger',
};
