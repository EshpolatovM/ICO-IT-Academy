import { describe, expect, it } from 'vitest';

import { DEFAULT_LIST_STATE, parseListState, toListParams } from './list-state';
import { nextSort, sortDirectionFor } from './sort';

describe('parseListState', () => {
  it("bo'sh query — standart holat", () => {
    expect(parseListState(new URLSearchParams())).toEqual(DEFAULT_LIST_STATE);
  });

  it("to'g'ri qiymatlarni o'qiydi", () => {
    const params = new URLSearchParams('page=3&pageSize=50&q=ali&status=INACTIVE&sort=lastName');
    expect(parseListState(params)).toEqual({
      page: 3,
      pageSize: 50,
      q: 'ali',
      status: 'INACTIVE',
      sort: 'lastName',
      groupId: undefined,
    });
  });

  it("noto'g'ri qiymatlar e'tiborsiz (standart), pageSize ≤ 100", () => {
    const params = new URLSearchParams('page=0&pageSize=500&status=DELETED&sort=phone');
    expect(parseListState(params)).toEqual(DEFAULT_LIST_STATE);
  });

  it("q 64 belgidan uzun bo'lsa kesiladi", () => {
    const state = parseListState(new URLSearchParams({ q: 'a'.repeat(100) }));
    expect(state.q).toHaveLength(64);
  });
});

describe('toListParams', () => {
  it("standart va bo'sh qiymatlar yozilmaydi", () => {
    expect(toListParams({ ...DEFAULT_LIST_STATE, q: '   ' }).toString()).toBe('');
  });

  it("o'zgargan qiymatlar yoziladi, q trim qilinadi", () => {
    const params = toListParams({
      ...DEFAULT_LIST_STATE,
      page: 2,
      q: ' ali ',
      status: 'ACTIVE',
      sort: '-lastName',
    });
    expect(params.toString()).toBe('page=2&q=ali&status=ACTIVE&sort=-lastName');
  });

  it("parse ↔ toListParams o'zaro mos", () => {
    const query = 'page=2&pageSize=50&q=vali&status=INACTIVE&sort=createdAt';
    expect(toListParams(parseListState(new URLSearchParams(query))).toString()).toBe(query);
  });
});

describe('sort', () => {
  it("ustun yo'nalishi", () => {
    expect(sortDirectionFor('lastName', 'lastName')).toBe('asc');
    expect(sortDirectionFor('-lastName', 'lastName')).toBe('desc');
    expect(sortDirectionFor('-createdAt', 'lastName')).toBeNull();
    expect(sortDirectionFor('-createdAt', 'createdAt')).toBe('desc');
  });

  it("bosilganda: o'sish ↔ kamayish, boshqa ustundan — o'sish", () => {
    expect(nextSort('-createdAt', 'lastName')).toBe('lastName');
    expect(nextSort('lastName', 'lastName')).toBe('-lastName');
    expect(nextSort('-lastName', 'lastName')).toBe('lastName');
    expect(nextSort('-createdAt', 'createdAt')).toBe('createdAt');
  });
});
