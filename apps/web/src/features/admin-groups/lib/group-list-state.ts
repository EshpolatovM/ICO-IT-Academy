import { z } from 'zod';

import {
  GROUP_SEARCH_MAX_LENGTH,
  groupStatusSchema,
  offsetPaginationQuerySchema,
  PAGINATION_DEFAULTS,
} from '@lms/shared';

import type { GroupListState } from '../types/admin-groups.types';

/** URL va API'da bir xil query kalitlari (docs/12 §2.2). */
const GROUP_LIST_KEYS = ['page', 'pageSize', 'q', 'status', 'pathId', 'mentorId'] as const;

export const DEFAULT_GROUP_LIST_STATE: GroupListState = {
  page: PAGINATION_DEFAULTS.page,
  pageSize: PAGINATION_DEFAULTS.pageSize,
  q: '',
  status: undefined,
  pathId: undefined,
  mentorId: undefined,
};

const uuidSchema = z.uuid();

type ReadableParams = Pick<URLSearchParams, 'get'>;

function readOptional<T>(schema: z.ZodType<T>, raw: string | null): T | undefined {
  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : undefined;
}

/** URL query → jadval holati; noto'g'ri qiymat — standart (API'ga noto'g'ri parametr ketmaydi). */
export function parseGroupListState(params: ReadableParams): GroupListState {
  const pagination = offsetPaginationQuerySchema.safeParse({
    page: params.get('page') ?? undefined,
    pageSize: params.get('pageSize') ?? undefined,
  });
  return {
    page: pagination.success ? pagination.data.page : DEFAULT_GROUP_LIST_STATE.page,
    pageSize: pagination.success ? pagination.data.pageSize : DEFAULT_GROUP_LIST_STATE.pageSize,
    q: (params.get('q') ?? '').slice(0, GROUP_SEARCH_MAX_LENGTH),
    status: readOptional(groupStatusSchema, params.get('status')),
    pathId: readOptional(uuidSchema, params.get('pathId')),
    mentorId: readOptional(uuidSchema, params.get('mentorId')),
  };
}

function serialize(state: GroupListState, key: (typeof GROUP_LIST_KEYS)[number]): string {
  const value = state[key];
  if (value === undefined) {
    return '';
  }
  const text = String(value).trim();
  return text === String(DEFAULT_GROUP_LIST_STATE[key] ?? '') ? '' : text;
}

/** Jadval holati → query satri (URL va API uchun). Standart va bo'sh qiymatlar yozilmaydi. */
export function toGroupListParams(state: GroupListState): URLSearchParams {
  const params = new URLSearchParams();
  GROUP_LIST_KEYS.forEach((key) => {
    const value = serialize(state, key);
    if (value !== '') {
      params.set(key, value);
    }
  });
  return params;
}
