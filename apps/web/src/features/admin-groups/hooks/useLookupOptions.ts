'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { ComboboxOption } from '@/components/ui';
import { useDebouncedValue } from '@/lib/hooks';

import { adminGroupsKeys } from '../api/admin-groups.query-keys';
import { lookupsApi } from '../api/lookups.api';
import { toMentorOption, toStudentOption } from '../lib/options';

/** Combobox qidiruvi: matn debounce bilan so'rovga aylanadi. */
function useSearchText() {
  const [text, setText] = useState('');
  return { text: useDebouncedValue(text), setText };
}

/** Faol mentorlar qidiruvi (`GET /admin/mentors?q=&status=ACTIVE`) → Combobox variantlari. */
export function useMentorOptions() {
  const search = useSearchText();
  const query = useQuery({
    queryKey: adminGroupsKeys.mentorOptions(search.text),
    queryFn: async () => (await lookupsApi.mentors(search.text)).items.map(toMentorOption),
    placeholderData: keepPreviousData,
  });
  return { options: query.data ?? [], loading: query.isFetching, onSearch: search.setText };
}

/** Faol studentlar qidiruvi (`GET /admin/students?q=&status=ACTIVE`) → Combobox variantlari. */
export function useStudentOptions() {
  const search = useSearchText();
  const query = useQuery({
    queryKey: adminGroupsKeys.studentOptions(search.text),
    queryFn: async () => (await lookupsApi.students(search.text)).items.map(toStudentOption),
    placeholderData: keepPreviousData,
  });
  return { options: query.data ?? [], loading: query.isFetching, onSearch: search.setText };
}

/**
 * Filtrdagi tanlangan mentor (URL'da faqat id): yorlig'i `GET /admin/mentors/:id` dan;
 * foydalanuvchi tanlaganda — keshga darhol yoziladi (qayta so'rov yo'q).
 */
export function useMentorFilterOption(mentorId: string | undefined) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminGroupsKeys.mentorOption(mentorId ?? ''),
    queryFn: async () => toMentorOption(await lookupsApi.mentor(mentorId ?? '')),
    enabled: mentorId !== undefined,
  });
  const remember = (option: ComboboxOption) => {
    queryClient.setQueryData(adminGroupsKeys.mentorOption(option.value), option);
  };
  return { option: mentorId === undefined ? null : (query.data ?? null), remember };
}
