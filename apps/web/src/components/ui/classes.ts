/** Komponentlar orasida umumiy klass bo'laklari (DRY). Faqat token'lar asosidagi klasslar. */

/** Klaviatura fokusi uchun ko'rinadigan halqa. */
export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring';

/** Kiritish maydonlari (Input, kelajakda Select, Textarea) uchun umumiy ko'rinish. */
export const fieldBase =
  'block w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-disabled disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-disabled';

/** Xato holatidagi maydon chegarasi. */
export const fieldInvalid = 'border-danger';
