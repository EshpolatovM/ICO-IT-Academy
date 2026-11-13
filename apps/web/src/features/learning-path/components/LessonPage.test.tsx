import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';
import { renderWithQuery } from '@/lib/testing/render';

import { learningPathApi } from '../api/learning-path.api';
import { resetLearningPathMock } from '../api/learning-path.mock';
import { LESSON_FIXTURE } from '../lib/test-fixtures';
import { LessonStatus, TopicStatus } from '../types/learning-path.types';

import { LessonPage } from './LessonPage';

const IN_PROGRESS_LESSON = { ...LESSON_FIXTURE, status: LessonStatus.IN_PROGRESS };

describe('LessonPage', () => {
  beforeEach(() => {
    resetLearningPathMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('matn (Markdown), https video havola yangi tabda, orqaga — mavzuga', async () => {
    vi.spyOn(learningPathApi, 'getLesson').mockResolvedValue(IN_PROGRESS_LESSON);
    renderWithQuery(<LessonPage lessonId="l2" />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Label' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Sarlavha' })).toBeInTheDocument();
    const video = screen.getByRole('link', { name: /Videoni ko'rish/ });
    expect(video).toHaveAttribute('href', 'https://example.com/video');
    expect(video).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: /Formalar/ })).toHaveAttribute(
      'href',
      '/path/topics/t2',
    );
  });

  it("https bo'lmagan video havola ko'rsatilmaydi", async () => {
    vi.spyOn(learningPathApi, 'getLesson').mockResolvedValue({
      ...IN_PROGRESS_LESSON,
      videoUrl: 'http://example.com/v',
    });
    renderWithQuery(<LessonPage lessonId="l2" />);

    await screen.findByRole('heading', { level: 1, name: 'Label' });
    expect(screen.queryByRole('link', { name: /Videoni ko'rish/ })).not.toBeInTheDocument();
  });

  it('AVAILABLE dars ochilganda avtomatik start (M-6)', async () => {
    vi.spyOn(learningPathApi, 'getLesson').mockResolvedValue(LESSON_FIXTURE);
    const start = vi.spyOn(learningPathApi, 'startLesson').mockResolvedValue({
      lessonId: 'l2',
      lessonStatus: LessonStatus.IN_PROGRESS,
      topicStatus: TopicStatus.IN_PROGRESS,
      startedAt: '2026-11-13T10:00:00.000Z',
    });
    renderWithQuery(<LessonPage lessonId="l2" />);

    await waitFor(() => {
      expect(start).toHaveBeenCalledTimes(1);
    });
  });

  it('"Darsni tugatdim" → complete, "Dars tugallandi" va keyingi dars havolasi', async () => {
    const user = userEvent.setup();
    renderWithQuery(<LessonPage lessonId="lesson-tags-text" />);

    await user.click(await screen.findByRole('button', { name: 'Darsni tugatdim' }));

    expect(await screen.findByText('Dars tugallandi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Keyingi dars' })).toHaveAttribute(
      'href',
      '/path/lessons/lesson-forms-input',
    );
    expect(screen.queryByRole('button', { name: 'Darsni tugatdim' })).not.toBeInTheDocument();
  });

  it('complete xatosi — xabar', async () => {
    const user = userEvent.setup();
    vi.spyOn(learningPathApi, 'getLesson').mockResolvedValue(IN_PROGRESS_LESSON);
    vi.spyOn(learningPathApi, 'completeLesson').mockRejectedValue(
      new ApiError({ status: 409, code: ErrorCode.REVIEW_REQUIRED, message: 'Avval takrorlang' }),
    );
    renderWithQuery(<LessonPage lessonId="l2" />);

    await user.click(await screen.findByRole('button', { name: 'Darsni tugatdim' }));

    expect(await screen.findByText('Avval takrorlang')).toBeInTheDocument();
  });

  it('403 LOCKED va 404 holatlari', async () => {
    const getLesson = vi.spyOn(learningPathApi, 'getLesson');
    getLesson.mockRejectedValueOnce(
      new ApiError({ status: 403, code: ErrorCode.LOCKED, message: 'Qulflangan' }),
    );
    const { unmount } = renderWithQuery(<LessonPage lessonId="l3" />);
    expect(
      await screen.findByRole('heading', { name: 'Dars hali qulflangan' }),
    ).toBeInTheDocument();
    unmount();

    getLesson.mockRejectedValueOnce(
      new ApiError({ status: 404, code: ErrorCode.NOT_FOUND, message: 'Topilmadi' }),
    );
    renderWithQuery(<LessonPage lessonId="x" />);
    expect(await screen.findByText('Dars topilmadi')).toBeInTheDocument();
  });
});
