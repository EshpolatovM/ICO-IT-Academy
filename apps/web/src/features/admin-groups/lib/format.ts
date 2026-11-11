/** Sana ko'rinishi (o'zbek lokali). */
const DATE_LOCALE = 'uz-UZ';
const EMPTY_VALUE = '—';
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * `YYYY-MM-DD` (vaqt zonasisiz sana) → `DD.MM.YYYY`. `Date` orqali o'tkazilmaydi, chunki u UTC
 * yarim tun deb o'qiladi va manfiy zonalarda bir kun oldingi sana chiqadi. `null` — "—".
 */
export function formatDateOnly(value: string | null): string {
  const match = value === null ? null : DATE_ONLY_RE.exec(value);
  if (match === null) {
    return value ?? EMPTY_VALUE;
  }
  const [, year, month, day] = match;
  return `${day ?? ''}.${month ?? ''}.${year ?? ''}`;
}

/** ISO-8601 vaqt → sana. */
export function formatIsoDate(iso: string): string {
  return new Date(iso).toLocaleDateString(DATE_LOCALE);
}

/** Ism-familiya; shaxs yo'q bo'lsa — "—". */
export function personName(person: { firstName: string; lastName: string } | null): string {
  return person === null ? EMPTY_VALUE : `${person.firstName} ${person.lastName}`;
}
