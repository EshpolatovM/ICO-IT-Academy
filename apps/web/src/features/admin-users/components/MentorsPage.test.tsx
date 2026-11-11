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
import type { FetchMock, FetchRoutes } from '@/lib/testing/http';
import { resetNavigation } from '@/lib/testing/navigation';
import { renderWithQuery } from '@/lib/testing/render';

import { MENTOR_FIXTURE, pageOf } from '../lib/test-fixtures';

import { MentorsPage } from './MentorsPage';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

const LIST_URL = '/api/v1/admin/mentors';
const ITEM_URL = `${LIST_URL}/m1`;

function bodyOf(fetchMock: FetchMock, method: string): unknown {
  const call = fetchMock.mock.calls.find(([, init]) => init?.method === method);
  return call?.[1] === undefined ? undefined : requestJson(call[1]);
}

describe('MentorsPage', () => {
  let fetchMock: FetchMock;
  const user = userEvent.setup();

  function setup(routes: FetchRoutes = {}) {
    routeFetch(fetchMock, {
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([MENTOR_FIXTURE])),
      ...routes,
    });
    renderWithQuery(<MentorsPage />);
  }

  async function openRowDialog(button: string) {
    await user.click(await screen.findByRole('button', { name: button }));
    return screen.findByRole(button === 'Tahrirlash' ? 'dialog' : 'alertdialog');
  }

  beforeEach(() => {
    resetNavigation('/admin/mentors');
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("telefon va guruhlari ustunlari, bo'limlar navigatsiyasi", async () => {
    setup();
    expect(await screen.findByText('FE-12, BE-3')).toBeInTheDocument();
    expect(screen.getByText('+998901234567')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mentorlar' })).toHaveAttribute('aria-current', 'page');
  });

  it('yaratish: 409 CONFLICT (telefon band) — telefon maydoniga xato', async () => {
    setup({
      [`POST ${LIST_URL}`]: () =>
        errorResponse(409, 'CONFLICT', 'Bu telefon raqam boshqa akkauntda band', {
          field: 'phone',
        }),
    });
    await user.click(screen.getByRole('button', { name: 'Yangi mentor' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(/Telefon/), '+998 90 123-45-67');
    await user.type(within(dialog).getByLabelText(/Ism/), 'Vali');
    await user.type(within(dialog).getByLabelText(/Familiya/), 'Aliyev');
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    const phone = within(dialog).getByLabelText(/Telefon/);
    expect(
      await within(dialog).findByText('Bu telefon raqam boshqa akkauntda band'),
    ).toBeInTheDocument();
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(bodyOf(fetchMock, 'POST')).toEqual({
      phone: '+998901234567',
      firstName: 'Vali',
      lastName: 'Aliyev',
      password: null,
    });
  });

  it("tahrirlash: faqat o'zgargan maydon PATCH qilinadi", async () => {
    setup({
      [`PATCH ${ITEM_URL}`]: () => jsonResponse(200, { ...MENTOR_FIXTURE, lastName: 'Karimov' }),
    });
    const dialog = await openRowDialog('Tahrirlash');
    const lastName = within(dialog).getByLabelText(/Familiya/);
    await user.clear(lastName);
    await user.type(lastName, 'Karimov');
    await user.click(within(dialog).getByRole('button', { name: 'Saqlash' }));

    await vi.waitFor(() => {
      expect(bodyOf(fetchMock, 'PATCH')).toEqual({ lastName: 'Karimov' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('deaktivatsiya: tasdiqlash → PATCH {status: INACTIVE}; 403 xabari oynada', async () => {
    setup({
      [`PATCH ${ITEM_URL}`]: () =>
        errorResponse(403, 'FORBIDDEN', "O'z akkauntingizni o'zgartira olmaysiz"),
    });
    const dialog = await openRowDialog('Deaktivatsiya');
    await user.click(within(dialog).getByRole('button', { name: 'Deaktivatsiya qilish' }));

    expect(
      await within(dialog).findByText("O'z akkauntingizni o'zgartira olmaysiz"),
    ).toBeInTheDocument();
    expect(bodyOf(fetchMock, 'PATCH')).toEqual({ status: 'INACTIVE' });
  });

  it('parolni tiklash: POST /staff/:id/reset-password → vaqtinchalik parol', async () => {
    setup({
      'POST /api/v1/staff/m1/reset-password': () =>
        jsonResponse(200, { temporaryPassword: 'R4tkm8Hs2w' }),
    });
    const dialog = await openRowDialog('Parolni tiklash');
    await user.click(within(dialog).getByRole('button', { name: 'Tiklash' }));

    const result = await screen.findByRole('dialog', { name: 'Parol tiklandi' });
    expect(within(result).getByText('R4tkm8Hs2w')).toBeInTheDocument();
    await user.click(within(result).getByRole('button', { name: 'Tayyor' }));
    expect(screen.queryByText('R4tkm8Hs2w')).not.toBeInTheDocument();
  });
});
