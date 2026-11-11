'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { withQuery } from '@/lib/api';

import {
  DEFAULT_GROUP_LIST_STATE,
  parseGroupListState,
  toGroupListParams,
} from '../lib/group-list-state';

import type { GroupListPatch } from '../types/admin-groups.types';

/**
 * Guruhlar jadvali holati URL query'da (`?q=&status=&pathId=&mentorId=&page=`). Sahifadan
 * boshqa har qanday o'zgarishda 1-sahifaga qaytiladi.
 */
export function useGroupListUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = useMemo(() => parseGroupListState(searchParams), [searchParams]);

  const patch = useCallback(
    (changes: GroupListPatch) => {
      const params = toGroupListParams({
        ...state,
        page: DEFAULT_GROUP_LIST_STATE.page,
        ...changes,
      });
      router.replace(withQuery(pathname, params), { scroll: false });
    },
    [router, pathname, state],
  );

  return { state, patch };
}
