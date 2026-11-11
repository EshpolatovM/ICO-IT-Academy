/** Sana va vaqt ko'rinishi (o'zbek lokali). */
const DATE_LOCALE = 'uz-UZ';

/** ISO-8601 → sana (`11.11.2026`). */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE);
}

/** ISO-8601 → sana va vaqt; `null` — "—" (masalan hali kirmagan). */
export function formatDateTime(iso: string | null): string {
  return iso === null ? '—' : new Date(iso).toLocaleString(DATE_LOCALE);
}

/** "Ism Familiya". */
export function fullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}
