import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmAction } from '@/lib/testing/dialogs';
import { errorResponse, jsonResponse, mockFetch, routeFetch } from '@/lib/testing/http';
import type { FetchMock, FetchRoutes } from '@/lib/testing/http';
import { expectSecretNotCached } from '@/lib/testing/query-cache';
import { renderWithQuery } from '@/lib/testing/render';

import { API, IDS, STUDENT_FIXTURE } from '../lib/test-fixtures';

import { MentorStudentPage } from './MentorStudentPage';

const TEMP_PASSWORD = 'q7Lm2xPa9z';

function routes(extra: FetchRoutes = {}): FetchRoutes {
  return {
    [`GET ${API.student}`]: () => jsonResponse(200, STUDENT_FIXTURE),
    [`GET ${API.tokens}`]: () => jsonResponse(200, { items: [] }),
    ...extra,
  };
}

describe('MentorStudentPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ma'lumotlar: ID, ism, holat, guruh (→ guruh), oxirgi kirish; orqaga — guruhga", async () => {
    routeFetch(fetchMock, routes());
    renderWithQuery(<MentorStudentPage id={IDS.student} />);

    expect(
      await screen.findByRole('heading', { name: 'Ali Valiyev', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('ST-10245')).toBeInTheDocument();
    const groupLinks = screen.getAllByRole('link', { name: /FE-12/ });
    groupLinks.forEach((link) => {
      expect(link).toHaveAttribute('href', `/mentor/groups/${IDS.group}`);
    });
    expect(groupLinks).toHaveLength(2);
    expect(await screen.findByText("Faol ota-ona havolasi yo'q")).toBeInTheDocument();
  });

  it('404 — "Student topilmadi"', async () => {
    routeFetch(fetchMock, {
      [`GET ${API.student}`]: () => errorResponse(404, 'NOT_FOUND', 'Topilmadi'),
    });
    renderWithQuery(<MentorStudentPage id={IDS.student} />);

    expect(await screen.findByText('Student topilmadi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Guruhlar/ })).toHaveAttribute(
      'href',
      '/mentor/groups',
    );
  });

  it('parolni tiklash: POST /students/:id/reset-password, parol bir marta va keshsiz', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`POST ${API.resetPassword}`]: () =>
          jsonResponse(200, { temporaryPassword: TEMP_PASSWORD }),
      }),
    );
    const { queryClient } = renderWithQuery(<MentorStudentPage id={IDS.student} />);

    await confirmAction(user, 'Parolni tiklash', 'Tiklash');

    const dialog = await screen.findByRole('dialog', { name: 'Parol tiklandi' });
    expect(within(dialog).getByText(TEMP_PASSWORD)).toBeInTheDocument();
    await expectSecretNotCached(queryClient, TEMP_PASSWORD);

    await user.click(within(dialog).getByRole('button', { name: 'Tayyor' }));
    expect(screen.queryByText(TEMP_PASSWORD)).not.toBeInTheDocument();
  });

  it('parolni tiklash xatosi — tasdiqlash oynasida xabar', async () => {
    const user = userEvent.setup();
    routeFetch(
      fetchMock,
      routes({
        [`POST ${API.resetPassword}`]: () => errorResponse(404, 'NOT_FOUND', 'Student topilmadi'),
      }),
    );
    renderWithQuery(<MentorStudentPage id={IDS.student} />);

    await confirmAction(user, 'Parolni tiklash', 'Tiklash');

    const confirm = screen.getByRole('alertdialog');
    expect(await within(confirm).findByText('Student topilmadi')).toBeInTheDocument();
  });
});
