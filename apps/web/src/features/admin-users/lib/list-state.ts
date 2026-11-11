import {
  offsetPaginationQuerySchema,
  PAGINATION_DEFAULTS,
  USER_SEARCH_MAX_LENGTH,
  USER_SORT_DEFAULT,
  UserSort,
  userStatusSchema,
} from '@lms/shared';

import type { UserListState } from '../types/admin-users.types';

/** URL query kalitlari (API parametrlari bilan bir xil nomlar, docs/12 §2.1). */
export const ListParam = {
  PAGE: 'page',
  PAGE_SIZE: 'pageSize',
  Q: 'q',
  STATUS: 'status',
  SORT: 'sort',
  GROUP_ID: 'groupId',
} as const;

export const DEFAULT_LIST_STATE: UserListState = {
  page: PAGINATION_DEFAULTS.page,
  pageSize: PAGINATION_DEFAULTS.pageSize,
  q: '',
  status: undefined,
  sort: USER_SORT_DEFAULT,
  groupId: undefined,
};

const SORT_VALUES: ReadonlySet<string> = new Set(Object.values(UserSort));

function isUserSort(value: string | null): value is UserSort {
  return value !== null && SORT_VALUES.has(value);
}

type ReadableParams = Pick<URLSearchParams, 'get'>;

function parsePagination(params: ReadableParams): Pick<UserListState, 'page' | 'pageSize'> {
  const parsed = offsetPaginationQuerySchema.safeParse({
    page: params.get(ListParam.PAGE) ?? undefined,
    pageSize: params.get(ListParam.PAGE_SIZE) ?? undefined,
  });
  return parsed.success
    ? parsed.data
    : { page: DEFAULT_LIST_STATE.page, pageSize: DEFAULT_LIST_STATE.pageSize };
}

/** URL query → jadval holati. Noto'g'ri qiymatlar e'tiborsiz qoldiriladi (standart qiymat). */
export function parseListState(params: ReadableParams): UserListState {
  const status = userStatusSchema.safeParse(params.get(ListParam.STATUS));
  const sort = params.get(ListParam.SORT);
  return {
    ...parsePagination(params),
    q: (params.get(ListParam.Q) ?? '').slice(0, USER_SEARCH_MAX_LENGTH),
    status: status.success ? status.data : undefined,
    sort: isUserSort(sort) ? sort : DEFAULT_LIST_STATE.sort,
    groupId: params.get(ListParam.GROUP_ID) ?? undefined,
  };
}

/**
 * Jadval holati → query satri (URL va API uchun bir xil). Standart qiymatlar va bo'sh maydonlar
 * yozilmaydi — API sxemasi qat'iy (`z.strictObject`), URL esa qisqa qoladi.
 */
export function toListParams(state: UserListState): URLSearchParams {
  const params = new URLSearchParams();
  const entries: [string, string | undefined, string | undefined][] = [
    [ListParam.PAGE, String(state.page), String(DEFAULT_LIST_STATE.page)],
    [ListParam.PAGE_SIZE, String(state.pageSize), String(DEFAULT_LIST_STATE.pageSize)],
    [ListParam.Q, state.q.trim(), ''],
    [ListParam.STATUS, state.status, undefined],
    [ListParam.SORT, state.sort, DEFAULT_LIST_STATE.sort],
    [ListParam.GROUP_ID, state.groupId, undefined],
  ];
  entries.forEach(([key, value, defaultValue]) => {
    if (value !== undefined && value !== '' && value !== defaultValue) {
      params.set(key, value);
    }
  });
  return params;
}
