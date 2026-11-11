import type { ManagedUserBase } from '@lms/shared';

import { formatDate, fullName } from '../lib/format';

import { UserStatusBadge } from './UserStatusBadge';

import type { UserListColumn } from '../types/admin-users.types';
import type { ReactNode } from 'react';

/** Ism-familiya ustuni (familiya bo'yicha saralanadi); `render` — masalan tafsilot havolasi. */
export function nameColumn<T extends ManagedUserBase>(
  render: (item: T) => ReactNode = fullName,
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
