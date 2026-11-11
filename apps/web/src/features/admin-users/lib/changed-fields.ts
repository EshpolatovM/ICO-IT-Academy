/** Faqat boshlang'ich qiymatdan farq qiladigan maydonlar (`PATCH` body'si uchun). */
export function changedFields<T extends object>(values: T, initial: T): Partial<T> {
  const keys = Object.keys(values) as (keyof T)[];
  return keys.reduce<Partial<T>>((changes, key) => {
    if (values[key] !== initial[key]) {
      changes[key] = values[key];
    }
    return changes;
  }, {});
}
