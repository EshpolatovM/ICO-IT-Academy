import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCall, jsonResponse, mockFetch, requestJson } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderHookWithQuery } from '@/lib/testing/render';

import { adminGroupsKeys } from '../api/admin-groups.query-keys';
import { DEFAULT_GROUP_LIST_STATE } from '../lib/group-list-state';
import { GROUP_FIXTURE, IDS, MENTOR_FIXTURE, pageOf } from '../lib/test-fixtures';

import { useAssignGroupMentor, useRemoveGroupMember } from './useGroupMutations';
import { useGroup, useGroupList } from './useGroupQueries';
import {
  useGroupFilterOption,
  useGroupOptions,
  useMentorFilterOption,
  useMentorOptions,
} from './useLookupOptions';

const GROUP_URL = `/api/v1/admin/groups/${IDS.group}`;

describe('admin-groups query hooks', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('useGroupList — holatdan query satri bilan GET /admin/groups', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, pageOf([GROUP_FIXTURE])));
    const state = { ...DEFAULT_GROUP_LIST_STATE, page: 2, status: 'ACTIVE' as const };
    const { result } = renderHookWithQuery(() => useGroupList(state));

    await waitFor(() => {
      expect(result.current.data?.items).toHaveLength(1);
    });
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/admin/groups?page=2&status=ACTIVE');
  });

  it('useGroup — GET /admin/groups/:id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, GROUP_FIXTURE));
    const { result } = renderHookWithQuery(() => useGroup(IDS.group));

    await waitFor(() => {
      expect(result.current.data).toEqual(GROUP_FIXTURE);
    });
    expect(fetchCall(fetchMock, 0).url).toBe(GROUP_URL);
  });

  it('useAssignGroupMentor — PUT …/mentor, javob tafsilot keshiga', async () => {
    const next = { ...GROUP_FIXTURE, mentor: null };
    fetchMock.mockResolvedValue(jsonResponse(200, next));
    const { result, queryClient } = renderHookWithQuery(() => useAssignGroupMentor(IDS.group));

    await act(() => result.current.mutateAsync({ mentorId: null }));
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe(`${GROUP_URL}/mentor`);
    expect(init.method).toBe('PUT');
    expect(requestJson(init)).toEqual({ mentorId: null });
    expect(queryClient.getQueryData(adminGroupsKeys.detail(IDS.group))).toEqual(next);
  });

  it('useRemoveGroupMember — DELETE …/members/:studentId (204), tafsilot eskiradi', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    const { result, queryClient } = renderHookWithQuery(() => useRemoveGroupMember(IDS.group));
    queryClient.setQueryData(adminGroupsKeys.detail(IDS.group), GROUP_FIXTURE);

    await act(() => result.current.mutateAsync(IDS.student));
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe(`${GROUP_URL}/members/${IDS.student}`);
    expect(init.method).toBe('DELETE');
    expect(queryClient.getQueryState(adminGroupsKeys.detail(IDS.group))?.isInvalidated).toBe(true);
  });

  it('useMentorOptions — faqat faol mentorlar, debounce bilan qidiruv', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, pageOf([MENTOR_FIXTURE])));
    const { result } = renderHookWithQuery(() => useMentorOptions());

    await waitFor(() => {
      expect(result.current.options).toEqual([
        { value: IDS.mentor, label: 'Bobur Karimov', description: '+998901234567' },
      ]);
    });
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/admin/mentors?status=ACTIVE');

    act(() => {
      result.current.onSearch(' bob ');
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchCall(fetchMock, 1).url).toBe('/api/v1/admin/mentors?status=ACTIVE&q=bob');
  });

  it("useMentorFilterOption — URL'dagi id yorlig'i GET /admin/mentors/:id dan", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, MENTOR_FIXTURE));
    const { result } = renderHookWithQuery(() => useMentorFilterOption(IDS.mentor));

    await waitFor(() => {
      expect(result.current.option?.label).toBe('Bobur Karimov');
    });
    expect(fetchCall(fetchMock, 0).url).toBe(`/api/v1/admin/mentors/${IDS.mentor}`);
  });

  it("useMentorFilterOption — id yo'q bo'lsa so'rov yo'q", () => {
    const { result } = renderHookWithQuery(() => useMentorFilterOption(undefined));
    expect(result.current.option).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("useGroupOptions — faqat faol guruhlar, sort'siz, q bilan qidiruv", async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(200, pageOf([GROUP_FIXTURE]))));
    const { result } = renderHookWithQuery(() => useGroupOptions());

    await waitFor(() => {
      expect(result.current.options).toEqual([
        { value: IDS.group, label: 'FE-12', description: 'Frontend dasturchi' },
      ]);
    });
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/admin/groups?status=ACTIVE');

    act(() => {
      result.current.onSearch(' fe ');
    });
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(fetchCall(fetchMock, 1).url).toBe('/api/v1/admin/groups?status=ACTIVE&q=fe');
  });

  it("useGroupFilterOption — URL'dagi id yorlig'i GET /admin/groups/:id dan", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, GROUP_FIXTURE));
    const { result } = renderHookWithQuery(() => useGroupFilterOption(IDS.group));

    await waitFor(() => {
      expect(result.current.option?.label).toBe('FE-12');
    });
    expect(fetchCall(fetchMock, 0).url).toBe(GROUP_URL);
  });
});
