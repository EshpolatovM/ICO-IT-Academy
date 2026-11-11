'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { adminGroupsKeys } from '../api/admin-groups.query-keys';
import { groupsApi, pathsApi } from '../api/groups.api';
import { toGroupListParams } from '../lib/group-list-state';

import type { GroupListState } from '../types/admin-groups.types';

/** `GET /admin/groups` (offset pagination); sahifa almashganda eski ma'lumot ko'rinib turadi. */
export function useGroupList(state: GroupListState) {
  const params = toGroupListParams(state);
  return useQuery({
    queryKey: adminGroupsKeys.list(params.toString()),
    queryFn: () => groupsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** `GET /admin/groups/:id` — tafsilot va a'zolar. */
export function useGroup(id: string) {
  return useQuery({
    queryKey: adminGroupsKeys.detail(id),
    queryFn: () => groupsApi.get(id),
  });
}

/** `GET /admin/paths` — filtr va forma uchun yo'llar. */
export function useLearningPaths() {
  return useQuery({
    queryKey: adminGroupsKeys.paths(),
    queryFn: pathsApi.list,
    select: (data) => data.items,
  });
}
