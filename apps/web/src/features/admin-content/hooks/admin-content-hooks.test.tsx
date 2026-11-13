import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { renderHookWithQuery } from '@/lib/testing/render';

import { adminContentApi } from '../api/admin-content.api';
import { resetAdminContentMock } from '../api/admin-content.mock';
import { adminContentKeys } from '../api/admin-content.query-keys';

import { useAdminLesson, useAdminPaths, usePathTree } from './useAdminContentQueries';
import { useDeletePath } from './usePathMutations';
import { useReorder } from './useReorder';

describe('admin-content hooks', () => {
  beforeEach(() => {
    resetAdminContentMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("useAdminPaths / usePathTree / useAdminLesson — API qatlamidan ma'lumot", async () => {
    const paths = renderHookWithQuery(() => useAdminPaths());
    const tree = renderHookWithQuery(() => usePathTree('path-frontend'));
    const lesson = renderHookWithQuery(() => useAdminLesson('lesson-tags-text'));

    await waitFor(() => {
      expect(paths.result.current.data?.items).toHaveLength(2);
    });
    await waitFor(() => {
      expect(tree.result.current.data?.sections).toHaveLength(2);
    });
    await waitFor(() => {
      expect(lesson.result.current.data?.topic.title).toBe('HTML teglari');
    });
  });

  it("usePathTree — noma'lum yo'l 404", async () => {
    const { result } = renderHookWithQuery(() => usePathTree('nope'));
    await waitFor(() => {
      expect(result.current.error).toMatchObject({ code: ErrorCode.NOT_FOUND });
    });
  });

  it('useReorder — darajaga mos endpoint va butun kontent keshi yangilanadi', async () => {
    const reorderLessons = vi.spyOn(adminContentApi, 'reorderLessons');
    const { result, queryClient } = renderHookWithQuery(() => useReorder());
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        level: 'lessons',
        parentId: 'topic-html-tags',
        ids: ['lesson-tags-text', 'lesson-tags-intro'],
      });
    });

    expect(reorderLessons).toHaveBeenCalledWith('topic-html-tags', [
      'lesson-tags-text',
      'lesson-tags-intro',
    ]);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: adminContentKeys.all });
  });

  it('useDeletePath — 409 xatosi mutatsiya holatida, kesh yangilanmaydi', async () => {
    const { result, queryClient } = renderHookWithQuery(() => useDeletePath('path-frontend'));
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => undefined);
    });

    await waitFor(() => {
      expect(result.current.error).toMatchObject({ code: ErrorCode.CONFLICT });
    });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
