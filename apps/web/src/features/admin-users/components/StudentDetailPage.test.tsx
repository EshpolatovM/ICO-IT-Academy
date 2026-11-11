import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  errorResponse,
  jsonResponse,
  mockFetch,
  requestJson,
  routeFetch,
} from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';

import { STUDENT_FIXTURE } from '../lib/test-fixtures';

import { StudentDetailPage } from './StudentDetailPage';

const ITEM_URL = '/api/v1/admin/students/s1';

describe('StudentDetailPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ma\'lumotlar, tahrirlash (faqat o\'zgargan maydon) va "Saqlandi"', async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, {
      [`GET ${ITEM_URL}`]: () => jsonResponse(200, STUDENT_FIXTURE),
      [`PATCH ${ITEM_URL}`]: () => jsonResponse(200, { ...STUDENT_FIXTURE, firstName: 'Alisher' }),
    });
    renderWithQuery(<StudentDetailPage id="s1" />);

    expect(await screen.findByRole('heading', { name: 'Ali Valiyev' })).toBeInTheDocument();
    expect(screen.getByText('ST-10245')).toBeInTheDocument();
    const firstName = screen.getByLabelText(/Ism/);
    await user.clear(firstName);
    await user.type(firstName, 'Alisher');
    await user.click(screen.getByRole('button', { name: 'Saqlash' }));

    expect(await screen.findByText('Saqlandi')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Alisher Valiyev' })).toBeInTheDocument();
    const patch = fetchMock.mock.calls.find(([, init]) => init?.method === 'PATCH');
    expect(patch?.[1] === undefined ? null : requestJson(patch[1])).toEqual({
      firstName: 'Alisher',
    });
  });

  it('parolni tiklash: POST /students/:id/reset-password → SecretReveal', async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, {
      [`GET ${ITEM_URL}`]: () => jsonResponse(200, STUDENT_FIXTURE),
      'POST /api/v1/students/s1/reset-password': () =>
        jsonResponse(200, { temporaryPassword: 'R4tkm8Hs2w' }),
    });
    renderWithQuery(<StudentDetailPage id="s1" />);

    await user.click(await screen.findByRole('button', { name: 'Parolni tiklash' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Tiklash' }),
    );
    const result = await screen.findByRole('dialog', { name: 'Parol tiklandi' });
    expect(within(result).getByText('R4tkm8Hs2w')).toBeInTheDocument();
  });

  it('404 — "Student topilmadi"', async () => {
    fetchMock.mockResolvedValue(errorResponse(404, 'NOT_FOUND', 'Topilmadi'));
    renderWithQuery(<StudentDetailPage id="s1" />);
    expect(await screen.findByText('Student topilmadi')).toBeInTheDocument();
  });
});
