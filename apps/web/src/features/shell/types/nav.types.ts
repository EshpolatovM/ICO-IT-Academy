/** Yon menyu bandi (docs/03 §0 layout'lari). */
export interface NavEntry {
  label: string;
  /** Berilmasa — band `disabled` (sahifa yo'li hali aniqlanmagan). */
  href?: string;
  /** Faqat super admin ko'radi (docs/03 §4.1). */
  superAdminOnly?: boolean;
}
