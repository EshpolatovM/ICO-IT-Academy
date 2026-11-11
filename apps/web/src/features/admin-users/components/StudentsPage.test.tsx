import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  errorResponse,
  fetchCall,
  jsonResponse,
  mockFetch,
  requestJson,
  requestUrl,
  routeFetch,
} from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { navigation, resetNavigation } from '@/lib/testing/navigation';
import { expectSecretNotCached } from '@/lib/testing/query-cache';
import { renderWithQuery } from '@/lib/testing/render';

import { pageOf, STUDENT_FIXTURE } from '../lib/test-fixtures';

import { StudentsPage } from './StudentsPage';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

const LIST_URL = '/api/v1/admin/students';
const GROUPS_ROUTE = { 'GET /api/v1/admin/groups': () => jsonResponse(200, pageOf([])) };

/** Ro'yxat so'rovining URL'i (guruh tanlovi ham parallel so'rov yuboradi). */
function listCallUrl(fetchMock: FetchMock): string | undefined {
  return fetchMock.mock.calls
    .map(([input]) => requestUrl(input))
    .find((url) => url.startsWith(LIST_URL));
}
const CREATED = {
  id: 's2',
  studentCode: 'ST-10246',
  temporaryPassword: 'q7Lm2xPa9z',
  mustChangePassword: true,
};

describe('StudentsPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetNavigation('/admin/students');
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ro'yxatni ko'rsatadi: ID va ism tafsilot havolasi, guruh, holat", async () => {
    routeFetch(fetchMock, {
      ...GROUPS_ROUTE,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([STUDENT_FIXTURE])),
    });
    renderWithQuery(<StudentsPage />);

    const link = await screen.findByRole('link', { name: 'ST-10245' });
    expect(link).toHaveAttribute('href', '/admin/students/s1');
    expect(screen.getByRole('link', { name: 'Ali Valiyev' })).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Faol')).toBeInTheDocument();
    expect(screen.getByText('1 ta natija')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Guruh' })).toBeEnabled();
  });

  it('URL query API so\'roviga uzatiladi; bo\'sh natija — "Hech narsa topilmadi"', async () => {
    resetNavigation('/admin/students', 'q=zz&status=INACTIVE');
    routeFetch(fetchMock, {
      ...GROUPS_ROUTE,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([])),
    });
    renderWithQuery(<StudentsPage />);

    expect(await screen.findByText('Hech narsa topilmadi')).toBeInTheDocument();
    expect(listCallUrl(fetchMock)).toBe(`${LIST_URL}?q=zz&status=INACTIVE`);
    expect(screen.getByLabelText('Qidiruv')).toHaveValue('zz');
  });

  it('xato holati — xabar va "Qayta urinish"', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(errorResponse(403, 'FORBIDDEN', "Ruxsat yo'q")),
    );
    renderWithQuery(<StudentsPage />);

    expect(await screen.findByText("Ruxsat yo'q")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument();
  });

  it("saralash va holat filtri URL query'ni yangilaydi", async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, {
      ...GROUPS_ROUTE,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([STUDENT_FIXTURE])),
    });
    renderWithQuery(<StudentsPage />);

    await user.click(await screen.findByRole('button', { name: /Ism-familiya/ }));
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/students?sort=lastName', {
      scroll: false,
    });
    await user.selectOptions(screen.getByLabelText('Holat'), 'INACTIVE');
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/students?status=INACTIVE', {
      scroll: false,
    });
  });

  it('yaratish: validatsiya, POST, vaqtinchalik parol BIR MARTA (keshsiz)', async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, {
      ...GROUPS_ROUTE,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([])),
      [`POST ${LIST_URL}`]: () => jsonResponse(201, CREATED),
    });
    const { queryClient } = renderWithQuery(<StudentsPage />);

    await user.click(screen.getByRole('button', { name: 'Yangi student' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));
    expect(await within(dialog).findAllByText(/kichik|belgi/i)).not.toHaveLength(0);

    await user.type(within(dialog).getByLabelText(/Ism/), ' Laylo ');
    await user.type(within(dialog).getByLabelText(/Familiya/), 'Karimova');
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    expect(await within(dialog).findByText('q7Lm2xPa9z')).toBeInTheDocument();
    expect(within(dialog).getByText('ST-10246')).toBeInTheDocument();
    const post = fetchMock.mock.calls.findIndex(([, init]) => init?.method === 'POST');
    expect(requestJson(fetchCall(fetchMock, post).init)).toEqual({
      firstName: 'Laylo',
      lastName: 'Karimova',
      groupId: null,
      password: null,
    });
    await expectSecretNotCached(queryClient, 'q7Lm2xPa9z');

    await user.click(within(dialog).getByRole('button', { name: 'Tayyor' }));
    expect(screen.queryByText('q7Lm2xPa9z')).not.toBeInTheDocument();
  });
});
