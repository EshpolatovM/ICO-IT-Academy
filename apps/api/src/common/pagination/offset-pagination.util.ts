import type { OffsetPaginationQuery } from '@lms/shared';

export interface SkipTake {
  skip: number;
  take: number;
}

/** `page`/`pageSize` (1 dan boshlanadi) → Prisma `skip`/`take`. */
export function toSkipTake({ page, pageSize }: OffsetPaginationQuery): SkipTake {
  return { skip: (page - 1) * pageSize, take: pageSize };
}
