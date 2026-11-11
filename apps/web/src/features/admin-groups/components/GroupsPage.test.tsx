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
import { renderWithQuery } from '@/lib/testing/render';

import { GROUP_FIXTURE, IDS, MENTOR_FIXTURE, pageOf, PATHS_FIXTURE } from '../lib/test-fixtures';

import { GroupsPage } from './GroupsPage';

vi.mock(
  'next/navigation',
  async () => (await import('@/lib/testing/navigation')).nextNavigationModule,
);

const LIST_URL = '/api/v1/admin/groups';
const LOOKUP_ROUTES = {
  'GET /api/v1/admin/paths': () => jsonResponse(200, PATHS_FIXTURE),
  'GET /api/v1/admin/mentors': () => jsonResponse(200, pageOf([MENTOR_FIXTURE])),
};

type User = ReturnType<typeof userEvent.setup>;

/** Bo'sh ro'yxat sahifasi + "Yangi guruh" oynasi; `POST` javobi berilgan. */
async function openCreateDialog(fetchMock: FetchMock, onCreate: () => Response) {
  routeFetch(fetchMock, {
    ...LOOKUP_ROUTES,
    [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([])),
    [`POST ${LIST_URL}`]: onCreate,
  });
  renderWithQuery(<GroupsPage />);
  await userEvent.click(screen.getByRole('button', { name: 'Yangi guruh' }));
  return screen.findByRole('dialog', { name: 'Yangi guruh' });
}

/** Majburiy maydonlar: nom va yo'l (yo'llar yuklanishini kutib). */
async function fillRequired(user: User, dialog: HTMLElement) {
  await user.type(within(dialog).getByLabelText(/Nom/), 'FE-12');
  const pathSelect = within(dialog).getByLabelText(/Yo'l/);
  await vi.waitFor(() => {
    expect(pathSelect).toBeEnabled();
  });
  await user.selectOptions(pathSelect, IDS.path);
}

describe('GroupsPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetNavigation('/admin/groups');
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("jadval: nom (havola), yo'l, mentor, studentlar soni, holat, sana", async () => {
    const noMentor = { ...GROUP_FIXTURE, id: 'g2', name: 'BE-3', mentor: null, startsAt: null };
    routeFetch(fetchMock, {
      ...LOOKUP_ROUTES,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([GROUP_FIXTURE, noMentor])),
    });
    renderWithQuery(<GroupsPage />);

    const link = await screen.findByRole('link', { name: 'FE-12' });
    expect(link).toHaveAttribute('href', `/admin/groups/${IDS.group}`);
    const table = screen.getByRole('table');
    expect(within(table).getByText('Bobur Karimov')).toBeInTheDocument();
    expect(within(table).getByText('01.12.2026')).toBeInTheDocument();
    expect(within(table).getAllByText('—')).toHaveLength(2);
    expect(within(table).getAllByText('Faol')).toHaveLength(2);
  });

  it('URL filtrlari API so\'roviga uzatiladi; bo\'sh natija — "Hech narsa topilmadi"', async () => {
    resetNavigation('/admin/groups', `status=ARCHIVED&pathId=${IDS.path}`);
    routeFetch(fetchMock, {
      ...LOOKUP_ROUTES,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([])),
    });
    renderWithQuery(<GroupsPage />);

    expect(await screen.findByText('Hech narsa topilmadi')).toBeInTheDocument();
    const listCall = fetchMock.mock.calls.findIndex(([input]) =>
      requestUrl(input).startsWith(LIST_URL),
    );
    expect(fetchCall(fetchMock, listCall).url).toBe(
      `${LIST_URL}?status=ARCHIVED&pathId=${IDS.path}`,
    );
  });

  it("holat va yo'l filtri URL'ni yangilaydi (1-sahifaga qaytib)", async () => {
    const user = userEvent.setup();
    resetNavigation('/admin/groups', 'page=3');
    routeFetch(fetchMock, {
      ...LOOKUP_ROUTES,
      [`GET ${LIST_URL}`]: () => jsonResponse(200, pageOf([GROUP_FIXTURE])),
    });
    renderWithQuery(<GroupsPage />);

    await screen.findByRole('link', { name: 'FE-12' });
    await user.selectOptions(screen.getByLabelText('Holat'), 'ARCHIVED');
    expect(navigation.replace).toHaveBeenLastCalledWith('/admin/groups?status=ARCHIVED', {
      scroll: false,
    });
    await user.selectOptions(screen.getByLabelText("Yo'l"), IDS.path);
    expect(navigation.replace).toHaveBeenLastCalledWith(`/admin/groups?pathId=${IDS.path}`, {
      scroll: false,
    });
  });

  it('xato holati — xabar va "Qayta urinish"', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(errorResponse(403, 'FORBIDDEN', "Ruxsat yo'q")),
    );
    renderWithQuery(<GroupsPage />);

    expect(await screen.findByText("Ruxsat yo'q")).toBeInTheDocument();
    expect(screen.getByText("Ma'lumotni yuklab bo'lmadi")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qayta urinish' })).toBeInTheDocument();
  });

  it('"Yangi guruh": POST body (bo\'sh sana — null), keyin guruh sahifasiga o\'tadi', async () => {
    const user = userEvent.setup();
    const dialog = await openCreateDialog(fetchMock, () => jsonResponse(201, GROUP_FIXTURE));
    await fillRequired(user, dialog);
    await user.click(within(dialog).getByRole('combobox', { name: 'Mentor' }));
    await user.click(await screen.findByRole('option', { name: /Bobur Karimov/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    await vi.waitFor(() => {
      expect(navigation.push).toHaveBeenCalledWith(`/admin/groups/${IDS.group}`);
    });
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(post?.[1] === undefined ? null : requestJson(post[1])).toEqual({
      name: 'FE-12',
      pathId: IDS.path,
      mentorId: IDS.mentor,
      startsAt: null,
    });
  });

  it('"Yangi guruh": 400 details[].field — xato tegishli maydonda', async () => {
    const user = userEvent.setup();
    const dialog = await openCreateDialog(fetchMock, () =>
      errorResponse(400, 'VALIDATION_ERROR', 'Xato', [
        { field: 'pathId', message: "Bunday yo'l yo'q" },
      ]),
    );
    await fillRequired(user, dialog);
    await user.click(within(dialog).getByRole('button', { name: 'Yaratish' }));

    expect(await within(dialog).findByText("Bunday yo'l yo'q")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Yo'l/)).toHaveAttribute('aria-invalid', 'true');
  });
});
