import type { UserSort } from '@lms/shared';

import type { SortDirection } from '@/components/ui';

import type { UserSortField } from '../types/admin-users.types';

/** Kamayish tartibi — `-` prefiksi (docs/12 §0: `?sort=-createdAt`). */
function descending(field: UserSortField): `-${UserSortField}` {
  return `-${field}`;
}

/** Ustun bo'yicha joriy saralash yo'nalishi (`null` — bu ustun bo'yicha emas). */
export function sortDirectionFor(sort: UserSort, field: UserSortField): SortDirection | null {
  if (sort === field) {
    return 'asc';
  }
  return sort === descending(field) ? 'desc' : null;
}

/** Ustun sarlavhasi bosilganda: shu ustun bo'yicha o'sish ↔ kamayish; boshqa ustundan — o'sish. */
export function nextSort(sort: UserSort, field: UserSortField): UserSort {
  return sort === field ? descending(field) : field;
}
