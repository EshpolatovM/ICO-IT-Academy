'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import type { UserSort, UserStatus } from '@lms/shared';

import { DEFAULT_LIST_STATE, parseListState, toListParams } from '../lib/list-state';

import type { UserListState } from '../types/admin-users.types';

/**
 * Jadval holati URL query'da (`?q=&status=&sort=&page=&groupId=`): sahifani yangilash, orqaga qaytish va
 * havolani ulashishda saqlanadi. Filtr/qidiruv/saralash o'zgarsa — 1-sahifaga qaytiladi.
 */
export function useListUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseListState(searchParams), [searchParams]);

  const update = useCallback(
    (patch: Partial<UserListState>) => {
      const next: UserListState = { ...state, page: DEFAULT_LIST_STATE.page, ...patch };
      const search = toListParams(next).toString();
      router.replace(search === '' ? pathname : `${pathname}?${search}`, { scroll: false });
    },
    [router, pathname, state],
  );

  return {
    state,
    setPage: (page: number) => {
      update({ page });
    },
    setQuery: (q: string) => {
      update({ q });
    },
    setStatus: (status: UserStatus | undefined) => {
      update({ status });
    },
    setSort: (sort: UserSort) => {
      update({ sort });
    },
    /** Faqat studentlar: guruh filtri (`undefined` — hammasi). */
    setGroupId: (groupId: string | undefined) => {
      update({ groupId });
    },
  };
}
