import type { ChestReward } from '@lms/shared';

/**
 * PATCH diff'i: faqat haqiqatan o'zgargan maydonlar (bir xil qiymat — o'zgarish emas, audit va
 * versiya yo'q). `equals` — maydon bo'yicha taqqoslash (standart — `Object.is`).
 */
export function diffChanges<TRecord extends object, TChanges extends Partial<TRecord>>(
  current: TRecord,
  request: TChanges,
  equals: (field: keyof TChanges, a: unknown, b: unknown) => boolean = (_field, a, b) =>
    Object.is(a, b),
): Partial<TChanges> {
  const entries = Object.entries(request).filter(([field, value]) => {
    const key = field as keyof TChanges & keyof TRecord;
    return value !== undefined && !equals(key, current[key], value);
  });
  return Object.fromEntries(entries) as Partial<TChanges>;
}

/** Sandiq mukofoti qiymat bo'yicha (jsonb kalit tartibi saqlanmaydi). */
export function sameReward(a: ChestReward, b: ChestReward): boolean {
  return (
    a.xp.min === b.xp.min &&
    a.xp.max === b.xp.max &&
    a.coin.min === b.coin.min &&
    a.coin.max === b.coin.max
  );
}

/** Diff bo'shmi (no-op PATCH). */
export function isEmptyDiff(diff: object): boolean {
  return Object.keys(diff).length === 0;
}
