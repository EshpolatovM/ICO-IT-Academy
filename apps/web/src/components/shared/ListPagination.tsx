import type { PaginatedResult } from '@lms/shared';

import { Pagination } from '@/components/ui';

export interface ListPaginationProps {
  /** Ro'yxat javobi; yuklanmagan yoki bo'sh bo'lsa — hech narsa ko'rsatilmaydi. */
  data: Pick<PaginatedResult<unknown>, 'page' | 'pageSize' | 'total'> | undefined;
  onPageChange: (page: number) => void;
}

/** Ro'yxat ostidagi sahifalash (faqat yozuvlar bo'lsa). */
export function ListPagination({ data, onPageChange }: ListPaginationProps) {
  if (data === undefined || data.total === 0) {
    return null;
  }
  return (
    <Pagination
      page={data.page}
      pageSize={data.pageSize}
      total={data.total}
      onPageChange={onPageChange}
    />
  );
}
