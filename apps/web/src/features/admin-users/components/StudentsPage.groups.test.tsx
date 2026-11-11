import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { adminGroupsKeys } from '@/features/admin-groups';
import {
  errorResponse,
  jsonResponse,
  lastRequestBody,
  mockFetch,
  requestUrl,
  routeFetch,
} from '@/lib/testing/http';
import type { FetchMock, FetchRoutes } from '@/lib/testing/http';
import { navigation, resetNavigation } from '@/lib/testing/navigation';
import { renderWithQuery } from '@/lib/testing/render';

import { GROUP_FIXTURE, pageOf, STUDENT_FIXTURE } from '../lib/test-fixtures';

import { StudentsPage } from './StudentsPage';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

const LIST_URL = '/api/v1/admin/students';
const GROUPS_URL = '/api/v1/admin/groups';
const CREATED = {
  id: 's2',
  studentCode: 'ST-10246',
  temporaryPassword: 'q7Lm2xPa9z',
  mustChangePassword: true,
};

function routes(extra: FetchRoutes = {}): FetchRoutes {
  return {
    [`GET ${GROUPS_URL}`]: () => jsonResponse(200, pageOf([GROUP_FIXTURE])),
    [`GET ${GROUPS_URL}/${GROUP_FIXTURE.id}`]: () => jsonResponse(200, GROUP_FIXTURE),
    [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([STUDENT_FIXTURE])),
    ...extra,
  };
}

function requestedUrls(fetchMock: FetchMock): string[] {
  return fetchMock.mock.calls.map(([input]) => requestUrl(input));
}

type User = ReturnType<typeof userEvent.setup>;

async function pickGroup(user: User, scope: HTMLElement) {
  await user.click(within(scope).getByRole('combobox', { name: /Guruh/ }));
  await user.click(await screen.findByRole('option', { name: /FE-12/ }));
}

async function openCreateDialog(user: User) {
  await user.click(screen.getByRole('button', { name: 'Yangi student' }));
  const dialog = await screen.findByRole('dialog');
  await user.type(within(dialog).getByLabelText(/Ism/), 'Laylo');
  await user.type(within(dialog).getByLabelText(/Familiya/), 'Karimova');
  return dialog;
}

describe('StudentsPage — guruh ulanishlari', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetNavigation('/admin/students');
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("guruh filtri: faqat faol guruhlar (sort'siz), tanlansa URL'ga groupId", async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, routes());
    renderWithQuery(<StudentsPage />);

    await screen.findByRole('link', { name: 'ST-10245' });
    await pickGroup(user, document.body);

    expect(navigation.replace).toHaveBeenLastCalledWith(
      `/admin/students?groupId=${GROUP_FIXTURE.id}`,
      { scroll: false },
    );
    expect(requestedUrls(fetchMock)).toContain(`${GROUPS_URL}?status=ACTIVE`);
    expect(requestedUrls(fetchMock).some((url) => url.includes('sort='))).toBe(false);
  });

  it("URL'dagi groupId: ro'yxat so'roviga uzatiladi, yorlig'i GET /admin/groups/:id dan", async () => {
    resetNavigation('/admin/students', `groupId=${GROUP_FIXTURE.id}`);
    routeFetch(fetchMock, routes());
    renderWithQuery(<StudentsPage />);

    const combobox = screen.getByRole('combobox', { name: 'Guruh' });
    await vi.waitFor(() => {
      expect(combobox).toHaveValue('FE-12');
    });
    expect(requestedUrls(fetchMock)).toContain(`${LIST_URL}?groupId=${GROUP_FIXTURE.id}`);
    expect(requestedUrls(fetchMock)).toContain(`${GROUPS_URL}/${GROUP_FIXTURE.id}`);
  });

  it('"Yangi student" guruh bilan: POST groupId, admin-groups keshi eskiradi', async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, routes({ [`POST ${LIST_URL}`]: () => jsonResponse(201, CREATED) }));
    const { queryClient } = renderWithQuery(<StudentsPage />);
    queryClient.setQueryData(adminGroupsKeys.detail(GROUP_FIXTURE.id), GROUP_FIXTURE);

    const dialog = await openCreateDialog(user);
    await pickGroup(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    expect(await within(dialog).findByText('q7Lm2xPa9z')).toBeInTheDocument();
    expect(lastRequestBody(fetchMock, 'POST')).toEqual({
      firstName: 'Laylo',
      lastName: 'Karimova',
      groupId: GROUP_FIXTURE.id,
      password: null,
    });
    const groupState = queryClient.getQueryState(adminGroupsKeys.detail(GROUP_FIXTURE.id));
    expect(groupState?.isInvalidated).toBe(true);
  });

  it('400 details[].field = groupId — xato guruh maydonida', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`POST ${LIST_URL}`]: () =>
          errorResponse(400, 'VALIDATION_ERROR', 'Xato', [
            { field: 'groupId', message: 'Guruh faol emas' },
          ]),
      }),
    );
    renderWithQuery(<StudentsPage />);

    const dialog = await openCreateDialog(user);
    await pickGroup(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    expect(await within(dialog).findByText('Guruh faol emas')).toBeInTheDocument();
    expect(within(dialog).getByRole('combobox', { name: /Guruh/ })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});
