import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchCall, jsonResponse, mockFetch, requestJson } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderHookWithQuery } from '@/lib/testing/render';

import { studentsApi } from '../api/students.api';
import { DEFAULT_LIST_STATE } from '../lib/list-state';
import { STUDENT_FIXTURE } from '../lib/test-fixtures';

import { useStudent } from './useStudent';
import { useUpdateUser } from './useUpdateUser';
import { useUserList } from './useUserList';

const STUDENT = STUDENT_FIXTURE;

describe('admin-users query hooks', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('useUserList — holatdan query satri bilan GET', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(200, { items: [STUDENT], total: 1, page: 2, pageSize: 20 }),
    );
    const state = { ...DEFAULT_LIST_STATE, page: 2, q: 'ali', sort: 'lastName' as const };
    const { result } = renderHookWithQuery(() => useUserList('students', studentsApi.list, state));

    await waitFor(() => {
      expect(result.current.data?.items).toEqual([STUDENT]);
    });
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/admin/students?page=2&q=ali&sort=lastName');
  });

  it('useStudent — GET /admin/students/:id', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, STUDENT));
    const { result } = renderHookWithQuery(() => useStudent('s1'));

    await waitFor(() => {
      expect(result.current.data).toEqual(STUDENT);
    });
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/admin/students/s1');
  });

  it("useUpdateUser — PATCH, javob tafsilot keshiga, ro'yxatlar invalidate", async () => {
    const updated = { ...STUDENT, status: 'INACTIVE' as const };
    fetchMock.mockResolvedValue(jsonResponse(200, updated));
    const { result, queryClient } = renderHookWithQuery(() =>
      useUpdateUser('students', studentsApi.update),
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({ id: 's1', body: { status: 'INACTIVE' } });
    });

    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe('/api/v1/admin/students/s1');
    expect(init.method).toBe('PATCH');
    expect(requestJson(init)).toEqual({ status: 'INACTIVE' });
    expect(queryClient.getQueryData(['admin-users', 'students', 'detail', 's1'])).toEqual(updated);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['admin-users', 'students', 'list'] });
  });
});
