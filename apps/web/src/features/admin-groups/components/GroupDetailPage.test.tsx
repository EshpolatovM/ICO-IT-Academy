import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  errorResponse,
  jsonResponse,
  lastRequestBody,
  mockFetch,
  routeFetch,
} from '@/lib/testing/http';
import type { FetchMock, FetchRoutes } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';

import { GROUP_FIXTURE, IDS, MENTOR_FIXTURE, pageOf, STUDENT_FIXTURE } from '../lib/test-fixtures';

import { GroupDetailPage } from './GroupDetailPage';

const GROUP_URL = `/api/v1/admin/groups/${IDS.group}`;
const ARCHIVED = { ...GROUP_FIXTURE, status: 'ARCHIVED' as const };

function routes(extra: FetchRoutes = {}, group = GROUP_FIXTURE): FetchRoutes {
  return {
    [`GET ${GROUP_URL}`]: () => jsonResponse(200, group),
    'GET /api/v1/admin/mentors': () => jsonResponse(200, pageOf([MENTOR_FIXTURE])),
    'GET /api/v1/admin/students': () => jsonResponse(200, pageOf([STUDENT_FIXTURE])),
    ...extra,
  };
}

async function pickStudent(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox', { name: /Student qo'shish/ }));
  await user.click(await screen.findByRole('option', { name: /Laylo Karimova/ }));
  await user.click(screen.getByRole('button', { name: "Qo'shish" }));
}

describe('GroupDetailPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sarlavha, holat, ma'lumotlar va a'zolar jadvali", async () => {
    routeFetch(fetchMock, routes());
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    expect(await screen.findByRole('heading', { name: 'FE-12', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guruhlar/ })).toHaveAttribute('href', '/admin/groups');
    expect(screen.getByRole('link', { name: 'ST-10245' })).toHaveAttribute(
      'href',
      `/admin/students/${IDS.student}`,
    );
    expect(screen.getByText('Frontend dasturchi')).toBeInTheDocument();
  });

  it('arxivlash — ConfirmDialog, PATCH { status: ARCHIVED }', async () => {
    const user = userEvent.setup();
    routeFetch(fetchMock, routes({ [`PATCH ${GROUP_URL}`]: () => jsonResponse(200, ARCHIVED) }));
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await user.click(await screen.findByRole('button', { name: 'Arxivlash' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Arxivlash' }),
    );

    expect(await screen.findByRole('button', { name: 'Qayta faollashtirish' })).toBeInTheDocument();
    expect(lastRequestBody(fetchMock, 'PATCH')).toEqual({ status: 'ARCHIVED' });
  });

  it('tahrirlash: 400 details[].field — xato maydonga tushadi', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`PATCH ${GROUP_URL}`]: () =>
          errorResponse(400, 'VALIDATION_ERROR', 'Xato', [
            { field: 'name', message: 'Nom juda uzun' },
          ]),
      }),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await user.click(await screen.findByRole('button', { name: 'Saqlash' }));
    expect(await screen.findByText('Nom juda uzun')).toBeInTheDocument();
    expect(lastRequestBody(fetchMock, 'PATCH')).toEqual({ name: 'FE-12', startsAt: '2026-12-01' });
  });

  it('mentorni olib tashlash — PUT …/mentor { mentorId: null }', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`PUT ${GROUP_URL}/mentor`]: () => jsonResponse(200, { ...GROUP_FIXTURE, mentor: null }),
      }),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await user.click(await screen.findByRole('button', { name: 'Olib tashlash' }));
    await vi.waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Olib tashlash' })).not.toBeInTheDocument();
    });
    expect(lastRequestBody(fetchMock, 'PUT')).toEqual({ mentorId: null });
  });

  it("student qo'shish — POST …/members, jadval yangilanadi", async () => {
    const user = userEvent.setup();
    const added = {
      ...GROUP_FIXTURE,
      membersCount: 2,
      members: [
        ...GROUP_FIXTURE.members,
        { ...STUDENT_FIXTURE, joinedAt: '2026-11-12T08:00:00.000Z' },
      ],
    };
    routeFetch(
      fetchMock,
      routes({ [`POST ${GROUP_URL}/members`]: () => jsonResponse(200, added) }),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await screen.findByRole('heading', { name: 'FE-12', level: 1 });
    await pickStudent(user);

    expect(await screen.findByRole('link', { name: 'ST-10246' })).toBeInTheDocument();
    expect(lastRequestBody(fetchMock, 'POST')).toEqual({ studentIds: [IDS.student2] });
  });

  it('409 STUDENT_ALREADY_IN_GROUP — studentlar nomi bilan aniq xabar', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`POST ${GROUP_URL}/members`]: () =>
          errorResponse(409, 'STUDENT_ALREADY_IN_GROUP', 'Band', { studentIds: [IDS.student2] }),
      }),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await screen.findByRole('heading', { name: 'FE-12', level: 1 });
    await pickStudent(user);

    expect(
      await screen.findByText('Allaqachon boshqa faol guruhda: Laylo Karimova'),
    ).toBeInTheDocument();
  });

  it("arxivlangan guruhda qo'shish disabled", async () => {
    routeFetch(fetchMock, routes({}, ARCHIVED));
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    expect(await screen.findByRole('button', { name: "Qo'shish" })).toBeDisabled();
    expect(screen.getByRole('combobox', { name: /Student qo'shish/ })).toBeDisabled();
    expect(screen.getByText("Arxivlangan guruhga qo'shib bo'lmaydi")).toBeInTheDocument();
  });

  it("a'zoni chiqarish — ConfirmDialog, DELETE …/members/:studentId", async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`DELETE ${GROUP_URL}/members/${IDS.student}`]: () => new Response(null, { status: 204 }),
      }),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);

    await user.click(await screen.findByRole('button', { name: 'Ali Valiyev — chiqarish' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Chiqarish' }),
    );

    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true);
  });

  it('404 — "Guruh topilmadi"', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve(errorResponse(404, 'NOT_FOUND', 'Topilmadi')),
    );
    renderWithQuery(<GroupDetailPage id={IDS.group} />);
    expect(await screen.findByText('Guruh topilmadi')).toBeInTheDocument();
  });
});
