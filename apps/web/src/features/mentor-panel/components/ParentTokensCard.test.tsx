import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmAction } from '@/lib/testing/dialogs';
import {
  errorResponse,
  jsonResponse,
  lastRequestBody,
  mockFetch,
  routeFetch,
} from '@/lib/testing/http';
import type { FetchMock, FetchRoutes } from '@/lib/testing/http';
import { expectSecretNotCached } from '@/lib/testing/query-cache';
import { renderWithQuery } from '@/lib/testing/render';

import { API, createdToken, IDS, TOKEN_FIXTURE } from '../lib/test-fixtures';

import { ParentTokensCard } from './ParentTokensCard';

const NEW_TOKEN = 'k2Jd8xAbCdEfGhIjKlMnOpQrStUvWxYz0123456789_';

function renderCard(extra: FetchRoutes, fetchMock: FetchMock) {
  routeFetch(fetchMock, {
    [`GET ${API.tokens}`]: () => jsonResponse(200, { items: [TOKEN_FIXTURE] }),
    ...extra,
  });
  return renderWithQuery(<ParentTokensCard studentId={IDS.student} studentName="Ali Valiyev" />);
}

describe('ParentTokensCard', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ro'yxat: yorliq, prefiks, foydalanishlar soni", async () => {
    renderCard({}, fetchMock);

    expect(await screen.findByText('Onasi')).toBeInTheDocument();
    expect(screen.getByText('k2Jd8x')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Onasi — bekor qilish' })).toBeInTheDocument();
  });

  it('yaratish: POST { label }, havola va kod bir marta, keshsiz', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderCard(
      { [`POST ${API.tokens}`]: () => jsonResponse(201, createdToken(NEW_TOKEN, 'Otasi')) },
      fetchMock,
    );

    await user.type(await screen.findByLabelText(/Yorliq/), 'Otasi');
    await user.click(screen.getByRole('button', { name: 'Havola yaratish' }));

    const dialog = await screen.findByRole('dialog', { name: 'Ota-ona havolasi yaratildi' });
    expect(within(dialog).getByText(`https://app.example.uz/parent#t=${NEW_TOKEN}`)).toBeVisible();
    expect(within(dialog).getByText(NEW_TOKEN)).toBeVisible();
    expect(lastRequestBody(fetchMock, 'POST')).toEqual({ label: 'Otasi' });
    await expectSecretNotCached(queryClient, NEW_TOKEN);

    await user.click(within(dialog).getByRole('button', { name: 'Tayyor' }));
    expect(screen.queryByText(NEW_TOKEN)).not.toBeInTheDocument();
  });

  it('yorliqsiz yaratish — label: null; server xatosi formada', async () => {
    const user = userEvent.setup();
    renderCard(
      { [`POST ${API.tokens}`]: () => errorResponse(429, 'RATE_LIMITED', "Juda ko'p urinish") },
      fetchMock,
    );

    await user.click(await screen.findByRole('button', { name: 'Havola yaratish' }));

    expect(await screen.findByText("Juda ko'p urinish")).toBeInTheDocument();
    expect(lastRequestBody(fetchMock, 'POST')).toEqual({ label: null });
  });

  it("bekor qilish: ConfirmDialog → DELETE, ro'yxat qayta yuklanadi", async () => {
    const user = userEvent.setup();
    renderCard({ [`DELETE ${API.token}`]: () => new Response(null, { status: 204 }) }, fetchMock);

    await confirmAction(user, 'Onasi — bekor qilish', 'Tokenni bekor qilish');

    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    const methods = fetchMock.mock.calls.map(([, init]) => init?.method ?? 'GET');
    expect(methods).toEqual(['GET', 'DELETE', 'GET']);
  });

  it('qayta yaratish: POST …/regenerate, yangi havola bir marta, keshsiz', async () => {
    const user = userEvent.setup();
    const { queryClient } = renderCard(
      {
        [`POST ${API.token}/regenerate`]: () =>
          jsonResponse(201, createdToken(NEW_TOKEN, TOKEN_FIXTURE.label)),
      },
      fetchMock,
    );

    await confirmAction(user, 'Onasi — qayta yaratish', 'Qayta yaratish');

    const dialog = await screen.findByRole('dialog', { name: 'Havola qayta yaratildi' });
    expect(within(dialog).getByText(NEW_TOKEN)).toBeVisible();
    await expectSecretNotCached(queryClient, NEW_TOKEN);
  });
});
