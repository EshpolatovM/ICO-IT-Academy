import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithQuery } from '@/lib/testing/render';

import { learningPathApi } from '../api/learning-path.api';
import { resetLearningPathMock } from '../api/learning-path.mock';
import { learningPathKeys } from '../api/learning-path.query-keys';
import { LessonStatus, TopicStatus } from '../types/learning-path.types';

import { useAutoStartLesson } from './useAutoStartLesson';
import { useLesson, usePathMap, useTopic } from './useLearningPathQueries';
import { useCompleteLesson } from './useLessonMutations';

describe('learning-path hooks', () => {
  beforeEach(() => {
    resetLearningPathMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("usePathMap / useTopic / useLesson — API qatlamidan ma'lumot", async () => {
    const map = renderHookWithQuery(() => usePathMap());
    const topic = renderHookWithQuery(() => useTopic('topic-html-tags'));
    const lesson = renderHookWithQuery(() => useLesson('lesson-tags-text'));

    await waitFor(() => {
      expect(map.result.current.data?.path?.title).toBe('Frontend dasturchi');
    });
    await waitFor(() => {
      expect(topic.result.current.data?.lessons).toHaveLength(2);
    });
    await waitFor(() => {
      expect(lesson.result.current.data?.status).toBe(LessonStatus.IN_PROGRESS);
    });
  });

  it('useCompleteLesson — javob va butun learning-path keshi invalidatsiyasi', async () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      useCompleteLesson('lesson-tags-text'),
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => {
      expect(result.current.data?.topicStatus).toBe(TopicStatus.COMPLETED);
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: learningPathKeys.all });
  });

  it('useAutoStartLesson — faqat AVAILABLE darsda, bir marta (M-6)', async () => {
    const start = vi.spyOn(learningPathApi, 'startLesson');
    const { rerender } = renderHookWithQuery(() =>
      useAutoStartLesson({ id: 'lesson-tags-text', status: LessonStatus.AVAILABLE }),
    );
    rerender();

    await waitFor(() => {
      expect(start).toHaveBeenCalledTimes(1);
    });
    expect(start).toHaveBeenCalledWith('lesson-tags-text');
  });

  it('useAutoStartLesson — IN_PROGRESS/COMPLETED darsda start chaqirilmaydi', () => {
    const start = vi.spyOn(learningPathApi, 'startLesson');
    renderHookWithQuery(() =>
      useAutoStartLesson({ id: 'lesson-tags-intro', status: LessonStatus.COMPLETED }),
    );
    expect(start).not.toHaveBeenCalled();
  });
});
