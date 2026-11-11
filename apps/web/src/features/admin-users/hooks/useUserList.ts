'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { ManagedUserBase } from '@lms/shared';

import { adminUsersKeys } from '@/lib/query';

import { toListParams } from '../lib/list-state';

import type { ManagedUserKind, UserListFetcher, UserListState } from '../types/admin-users.types';

/** Foydalanuvchilar ro'yxati (offset pagination); sahifa almashganda eski ma'lumot ko'rinib turadi. */
export function useUserList<T extends ManagedUserBase>(
  kind: ManagedUserKind,
  fetchList: UserListFetcher<T>,
  state: UserListState,
) {
  const params = toListParams(state);
  return useQuery({
    queryKey: adminUsersKeys.list(kind, params.toString()),
    queryFn: () => fetchList(params),
    placeholderData: keepPreviousData,
  });
}
