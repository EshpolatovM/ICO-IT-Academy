/** Pagination elementi: sahifa raqami yoki qisqartirish belgisi (…). */
export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

/** Joriy sahifaning har ikki tomonida ko'rsatiladigan qo'shni sahifalar soni. */
const SIBLING_COUNT = 1;
/** Joriy sahifaning chap va o'ng tomoni. */
const SIDES = 2;
/** Joriy sahifa atrofidagi barcha qo'shnilar soni. */
const SIBLING_SPAN = SIBLING_COUNT * SIDES;
/**
 * Doim bir xil miqdordagi elementlar: birinchi + oxirgi + joriy + qo'shnilar + 2 ta "…" o'rni.
 * Sahifalar soni shundan oshmasa, hammasi ko'rsatiladi.
 */
const FIXED_SLOTS = 5;
const MAX_ITEMS = SIBLING_SPAN + FIXED_SLOTS;
/** Birinchi sahifa (1) va undan keyingi "…" o'rnidan keyin boshlanadigan eng kichik raqam. */
const MIN_RANGE_START = 3;
/** Oxirgi sahifa va undan oldingi "…" o'rni. */
const TAIL_SLOTS = 2;

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Sahifa raqamlari ro'yxati (1 dan boshlab). Ko'p bo'lsa qisqartiriladi:
 * `1 … 4 5 6 … 10`. Elementlar soni doim bir xil — tugmalar "sakramaydi".
 */
export function getPaginationItems(page: number, pageCount: number): PaginationItem[] {
  if (pageCount <= MAX_ITEMS) {
    return range(1, pageCount);
  }

  const lastRangeEnd = pageCount - TAIL_SLOTS;
  const start = Math.max(
    Math.min(page - SIBLING_COUNT, pageCount - SIBLING_SPAN - TAIL_SLOTS),
    MIN_RANGE_START,
  );
  const end = Math.min(
    Math.max(page + SIBLING_COUNT, SIBLING_SPAN + MIN_RANGE_START),
    lastRangeEnd,
  );

  return [
    1,
    start > MIN_RANGE_START ? 'ellipsis-start' : MIN_RANGE_START - 1,
    ...range(start, end),
    end < lastRangeEnd ? 'ellipsis-end' : pageCount - 1,
    pageCount,
  ];
}
