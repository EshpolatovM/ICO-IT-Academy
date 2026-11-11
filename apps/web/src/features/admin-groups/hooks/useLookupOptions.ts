'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { ComboboxOption } from '@/components/ui';
import { useDebouncedValue } from '@/lib/hooks';

import { adminGroupsKeys } from '../api/admin-groups.query-keys';
import { lookupsApi } from '../api/lookups.api';
import { toGroupOption, toMentorOption, toStudentOption } from '../lib/options';

import type { QueryKey } from '@tanstack/react-query';

/** Combobox variantlari: qidiruv matni (debounce bilan) → so'rov → variantlar. */
function useSearchOptions(
  queryKey: (q: string) => QueryKey,
  load: (q: string) => Promise<ComboboxOption[]>,
) {
  const [text, setText] = useState('');
  const q = useDebouncedValue(text);
  const query = useQuery({
    queryKey: queryKey(q),
    queryFn: () => load(q),
    placeholderData: keepPreviousData,
  });
  return { options: query.data ?? [], loading: query.isFetching, onSearch: setText };
}

/**
 * Filtrdagi tanlangan variant (URL'da faqat id): yorlig'i id bo'yicha so'rovdan;
 * foydalanuvchi tanlaganda — keshga darhol yoziladi (qayta so'rov yo'q).
 */
function useSelectedOption(
  id: string | undefined,
  queryKey: (id: string) => QueryKey,
  load: (id: string) => Promise<ComboboxOption>,
) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: queryKey(id ?? ''),
    queryFn: () => load(id ?? ''),
    enabled: id !== undefined,
  });
  const remember = (option: ComboboxOption) => {
    queryClient.setQueryData(queryKey(option.value), option);
  };
  return { option: id === undefined ? null : (query.data ?? null), remember };
}

/** Faol mentorlar qidiruvi (`GET /admin/mentors?q=&status=ACTIVE`) → Combobox variantlari. */
export function useMentorOptions() {
  return useSearchOptions(adminGroupsKeys.mentorOptions, async (q) =>
    (await lookupsApi.mentors(q)).items.map(toMentorOption),
  );
}

/** Faol studentlar qidiruvi (`GET /admin/students?q=&status=ACTIVE`) → Combobox variantlari. */
export function useStudentOptions() {
  return useSearchOptions(adminGroupsKeys.studentOptions, async (q) =>
    (await lookupsApi.students(q)).items.map(toStudentOption),
  );
}

/** Faol guruhlar qidiruvi (`GET /admin/groups?q=&status=ACTIVE`, `sort`siz) → variantlar. */
export function useGroupOptions() {
  return useSearchOptions(adminGroupsKeys.groupOptions, async (q) =>
    (await lookupsApi.groups(q)).items.map(toGroupOption),
  );
}

/** Guruhlar filtridagi mentor: yorlig'i `GET /admin/mentors/:id` dan. */
export function useMentorFilterOption(mentorId: string | undefined) {
  return useSelectedOption(mentorId, adminGroupsKeys.mentorOption, async (id) =>
    toMentorOption(await lookupsApi.mentor(id)),
  );
}

/** Studentlar filtridagi guruh: yorlig'i `GET /admin/groups/:id` dan. */
export function useGroupFilterOption(groupId: string | undefined) {
  return useSelectedOption(groupId, adminGroupsKeys.groupOption, async (id) =>
    toGroupOption(await lookupsApi.group(id)),
  );
}
