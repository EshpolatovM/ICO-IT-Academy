import type { ManagedUserBase } from '@lms/shared';

import { UserStatusBadge } from '@/components/shared';
import { formatDate, personName } from '@/lib/format';

import type { UserListColumn } from '../types/admin-users.types';
import type { ReactNode } from 'react';

/** Ism-familiya ustuni (familiya bo'yicha saralanadi); `render` — masalan tafsilot havolasi. */
export function nameColumn<T extends ManagedUserBase>(
  render: (item: T) => ReactNode = personName,
): UserListColumn<T> {
  return { key: 'name', header: 'Ism-familiya', sortField: 'lastName', render };
}

export function statusColumn<T extends ManagedUserBase>(): UserListColumn<T> {
  return {
    key: 'status',
    header: 'Holat',
    render: (item) => <UserStatusBadge status={item.status} />,
  };
}

export function createdAtColumn<T extends ManagedUserBase>(): UserListColumn<T> {
  return {
    key: 'createdAt',
    header: 'Yaratilgan',
    sortField: 'createdAt',
    render: (item) => formatDate(item.createdAt),
  };
}
