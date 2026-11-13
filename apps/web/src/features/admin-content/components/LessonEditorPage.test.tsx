import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentStatus } from '@lms/shared';

import { renderWithQuery } from '@/lib/testing/render';

import { adminContentApi } from '../api/admin-content.api';
import { resetAdminContentMock } from '../api/admin-content.mock';
import { VIDEO_URL_MESSAGE } from '../schemas/content-fields.schemas';

import { LessonEditorPage } from './LessonEditorPage';

async function renderEditor() {
  renderWithQuery(<LessonEditorPage lessonId="lesson-tags-text" />);
  await screen.findByRole('heading', { level: 1, name: 'Matn teglari' });
}

describe('LessonEditorPage', () => {
  beforeEach(() => {
    resetAdminContentMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("orqaga — yo'l daraxtiga; 'Ko'rinish' tabida Markdown preview (yozilgan matn)", async () => {
    const user = userEvent.setup();
    await renderEditor();
    expect(screen.getByRole('link', { name: /Frontend dasturchi/ })).toHaveAttribute(
      'href',
      '/admin/paths/path-frontend',
    );

    const content = screen.getByLabelText(/Matn \(Markdown\)/);
    await user.clear(content);
    await user.type(content, '## Yangi bo‘lim');
    await user.click(screen.getByRole('tab', { name: "Ko'rinish" }));

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Yangi bo‘lim' }),
    ).toBeInTheDocument();
  });

  it("https bo'lmagan video havola — xato, so'rov yuborilmaydi", async () => {
    const user = userEvent.setup();
    const update = vi.spyOn(adminContentApi, 'updateLesson');
    await renderEditor();

    await user.type(screen.getByLabelText(/Video havola/), 'http://example.com/v');
    await user.click(screen.getByRole('button', { name: 'Saqlash' }));

    expect(await screen.findByText(VIDEO_URL_MESSAGE)).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });

  it("saqlash — barcha maydonlar bitta PATCH bilan, 'Saqlandi'", async () => {
    const user = userEvent.setup();
    const update = vi.spyOn(adminContentApi, 'updateLesson');
    await renderEditor();

    await user.type(screen.getByLabelText(/Video havola/), 'https://example.com/v');
    await user.type(screen.getByLabelText(/Taxminiy vaqt/), '12');
    await user.selectOptions(screen.getByLabelText(/Holat/), ContentStatus.ARCHIVED);
    await user.click(screen.getByRole('button', { name: 'Saqlash' }));

    expect(await screen.findByText('Saqlandi')).toBeInTheDocument();
    expect(update).toHaveBeenCalledWith('lesson-tags-text', {
      title: 'Matn teglari',
      contentMd: '# Matn teglari\n\nDars matni.',
      videoUrl: 'https://example.com/v',
      estMinutes: 12,
      status: ContentStatus.ARCHIVED,
    });
    await waitFor(() => {
      // Holat Badge'i (sarlavha yonida) + Select varianti.
      expect(screen.getAllByText('Arxivlangan')).toHaveLength(2);
    });
  });

  it("noma'lum dars — 'Dars topilmadi'", async () => {
    renderWithQuery(<LessonEditorPage lessonId="nope" />);
    expect(await screen.findByText('Dars topilmadi')).toBeInTheDocument();
  });
});
