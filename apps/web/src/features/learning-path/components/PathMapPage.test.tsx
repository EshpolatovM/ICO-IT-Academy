import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ApiError } from '@/lib/api';
import { renderWithQuery } from '@/lib/testing/render';

import { learningPathApi } from '../api/learning-path.api';
import { EMPTY_PATH_MAP, PATH_MAP_FIXTURE } from '../lib/test-fixtures';

import { PathMapPage } from './PathMapPage';

function mockMap(value: Awaited<ReturnType<typeof learningPathApi.getPathMap>>) {
  vi.spyOn(learningPathApi, 'getPathMap').mockResolvedValue(value);
}

describe('PathMapPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("yo'l nomi, umumiy progress, bo'lim va tugun holatlari", async () => {
    mockMap(PATH_MAP_FIXTURE);
    renderWithQuery(<PathMapPage />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Frontend dasturchi' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: "Yo'l progressi" })).toHaveAttribute(
      'aria-valuenow',
      '34',
    );
    expect(screen.getByRole('heading', { level: 2, name: 'HTML asoslari' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Teglar' })).toHaveAttribute('href', '/path/topics/t1');
    expect(screen.getByText('Ochishga tayyor')).toBeInTheDocument();
  });

  it('LOCKED mavzu bosilmaydi, joriy pozitsiya — birinchi ochiq mavzu', async () => {
    mockMap(PATH_MAP_FIXTURE);
    renderWithQuery(<PathMapPage />);

    const locked = await screen.findByText('Jadvallar');
    expect(locked.closest('a')).toBeNull();
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('link', { name: 'Formalar' }).closest('[aria-current="step"]'),
    ).not.toBeNull();
    expect(screen.getByRole('button', { name: "Joriy joyga o'tish" })).toBeInTheDocument();
  });

  it('takrorlash bloki — ogohlantirish', async () => {
    mockMap({ ...PATH_MAP_FIXTURE, reviewBlock: { blocked: true, dueCount: 2 } });
    renderWithQuery(<PathMapPage />);

    expect(await screen.findByText('Takrorlash kerak')).toBeInTheDocument();
    expect(screen.getByText(/2 ta mavzu/)).toBeInTheDocument();
  });

  it("{ path: null } — bo'sh holat", async () => {
    mockMap(EMPTY_PATH_MAP);
    renderWithQuery(<PathMapPage />);

    expect(await screen.findByText("Ilm yo'li hali biriktirilmagan")).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('xato — xabar va "Qayta urinish"', async () => {
    vi.spyOn(learningPathApi, 'getPathMap').mockRejectedValue(
      new ApiError({
        status: 400,
        code: ErrorCode.BAD_REQUEST,
        message: "Ma'lumot noto'g'ri",
      }),
    );
    renderWithQuery(<PathMapPage />);

    expect(await screen.findByText("Ma'lumot noto'g'ri")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument();
  });
});
