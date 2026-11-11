/**
 * `aria-describedby` kabi bo'sh joy bilan ajratilgan id ro'yxatini yig'adi.
 * Bo'sh, `false`, `null`, `undefined` qiymatlar tashlab yuboriladi; hech narsa qolmasa `undefined`.
 */
export function joinIds(...ids: (string | false | null | undefined)[]): string | undefined {
  const present = ids.filter((value): value is string => typeof value === 'string' && value !== '');
  return present.length > 0 ? present.join(' ') : undefined;
}
