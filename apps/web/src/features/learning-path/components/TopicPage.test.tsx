import { screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';
import { renderWithQuery } from '@/lib/testing/render';

import { learningPathApi } from '../api/learning-path.api';
import { TOPIC_FIXTURE } from '../lib/test-fixtures';

import { TopicPage } from './TopicPage';

describe('TopicPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mavzu nomi, progress, darslar holatlari; qulflangan dars havola emas', async () => {
    vi.spyOn(learningPathApi, 'getTopic').mockResolvedValue(TOPIC_FIXTURE);
    renderWithQuery(<TopicPage topicId="t2" />);

    expect(await screen.findByRole('heading', { level: 1, name: 'Formalar' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ilm yo'li/ })).toHaveAttribute('href', '/path');
    expect(screen.getByRole('progressbar', { name: 'Mavzu progressi' })).toHaveAttribute(
      'aria-valuenow',
      '33',
    );
    const table = screen.getByRole('table');
    expect(within(table).getByRole('link', { name: 'Input' })).toHaveAttribute(
      'href',
      '/path/lessons/l1',
    );
    expect(within(table).getByText('Submit').closest('a')).toBeNull();
    expect(within(table).getByText('Qulflangan')).toBeInTheDocument();
    expect(screen.getByText('HTML')).toBeInTheDocument();
  });

  it('403 LOCKED — "Mavzu hali qulflangan"', async () => {
    vi.spyOn(learningPathApi, 'getTopic').mockRejectedValue(
      new ApiError({ status: 403, code: ErrorCode.LOCKED, message: 'Qulflangan' }),
    );
    renderWithQuery(<TopicPage topicId="t3" />);

    expect(
      await screen.findByRole('heading', { name: 'Mavzu hali qulflangan' }),
    ).toBeInTheDocument();
  });

  it('404 — "Mavzu topilmadi"', async () => {
    vi.spyOn(learningPathApi, 'getTopic').mockRejectedValue(
      new ApiError({ status: 404, code: ErrorCode.NOT_FOUND, message: 'Topilmadi' }),
    );
    renderWithQuery(<TopicPage topicId="x" />);

    expect(await screen.findByText('Mavzu topilmadi')).toBeInTheDocument();
  });
});
