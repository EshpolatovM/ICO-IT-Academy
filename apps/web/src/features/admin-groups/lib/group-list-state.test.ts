import { describe, expect, it } from 'vitest';

import {
  DEFAULT_GROUP_LIST_STATE,
  parseGroupListState,
  toGroupListParams,
} from './group-list-state';
import { IDS } from './test-fixtures';

describe('group-list-state', () => {
  it("bo'sh URL — standart holat, bo'sh query satri", () => {
    const state = parseGroupListState(new URLSearchParams());
    expect(state).toEqual(DEFAULT_GROUP_LIST_STATE);
    expect(toGroupListParams(state).toString()).toBe('');
  });

  it("to'g'ri qiymatlar o'qiladi va qayta yoziladi", () => {
    const search = `page=2&q=FE&status=ARCHIVED&pathId=${IDS.path}&mentorId=${IDS.mentor}`;
    const state = parseGroupListState(new URLSearchParams(search));
    expect(state).toMatchObject({ page: 2, q: 'FE', status: 'ARCHIVED', pathId: IDS.path });
    expect(toGroupListParams(state).toString()).toBe(search);
  });

  it("noto'g'ri qiymatlar e'tiborsiz (API'ga ketmaydi)", () => {
    const state = parseGroupListState(
      new URLSearchParams('page=0&status=DELETED&pathId=abc&mentorId=1'),
    );
    expect(state).toEqual(DEFAULT_GROUP_LIST_STATE);
  });

  it("qidiruv bo'sh joylari kesiladi, bo'sh qidiruv yozilmaydi", () => {
    expect(toGroupListParams({ ...DEFAULT_GROUP_LIST_STATE, q: '  fe ' }).toString()).toBe('q=fe');
    expect(toGroupListParams({ ...DEFAULT_GROUP_LIST_STATE, q: '   ' }).toString()).toBe('');
  });
});
