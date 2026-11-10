import { z } from 'zod';

/**
 * Offset pagination — admin jadvallari uchun (docs/12-api.md §0):
 * `?page=1&pageSize=20` → `{ items, total, page, pageSize }`.
 */
export const PAGINATION_DEFAULTS = Object.freeze({
  page: 1,
  pageSize: 20,
  maxPageSize: 100,
});

export const offsetPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.page),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION_DEFAULTS.maxPageSize)
    .default(PAGINATION_DEFAULTS.pageSize),
});

export type OffsetPaginationQuery = z.output<typeof offsetPaginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
