import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  errorResponse,
  fetchCall,
  jsonResponse,
  mockFetch,
  requestJson,
  requestHeader,
} from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';
import { resetParentSessionStore } from '@/stores/parent-session.store';

import { ParentAccessGate } from './ParentAccessGate';
import { ParentChildrenPage } from './ParentChildrenPage';

const navigation = vi.hoisted(() => ({
  replace: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => '/parent',
  useSearchParams: () => navigation.search,
}));

const TOKEN = 'k2Jd'.padEnd(43, 'x');
const OTHER_TOKEN = 'Zz9_'.padEnd(43, 'y');
const CHILD = { studentId: 's1', firstName: 'Ali', lastName: 'Valiyev', groupName: null };
const EXCHANGE_URL = '/api/v1/auth/parent/exchange';
const ME_URL = '/api/v1/auth/me';
const NO_SESSION = (): Response =>
  errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi');

function calledUrls(fetchMock: FetchMock): string[] {
  return fetchMock.mock.calls.map((_call, index) => fetchCall(fetchMock, index).url);
}

function renderGate() {
  return renderWithQuery(
    <ParentAccessGate>
      <ParentChildrenPage />
    </ParentAccessGate>,
  );
}

describe('ParentAccessGate', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetParentSessionStore();
    navigation.replace.mockReset();
    navigation.search = new URLSearchParams();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("?t= token URL'dan darhol tozalanadi va {tokens:[t], merge:true} bilan exchange qilinadi", async () => {
    navigation.search = new URLSearchParams({ t: TOKEN });
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { children: [CHILD] }));

    renderGate();

    expect(navigation.replace).toHaveBeenCalledWith('/parent');
    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument();
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe(EXCHANGE_URL);
    expect(init.method).toBe('POST');
    expect(requestJson(init)).toEqual({ tokens: [TOKEN], merge: true });
    expect(requestHeader(init, 'Authorization')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('`ps` sessiyasi amalda — faqat GET /auth/me, exchange CHAQIRILMAYDI (H3)', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { role: 'PARENT', children: [CHILD] }));

    renderGate();

    expect(await screen.findByTestId('parent-child-card')).toHaveTextContent('Ali Valiyev');
    expect(calledUrls(fetchMock)).toEqual([ME_URL]);
    const { init } = fetchCall(fetchMock, 0);
    expect(init.method).toBe('GET');
    expect(requestHeader(init, 'Authorization')).toBeNull();
  });

  it("`ps` tugagan (me 401) — body'siz exchange (cookie), muvaffaqiyatda farzandlar", async () => {
    fetchMock
      .mockResolvedValueOnce(NO_SESSION())
      .mockResolvedValueOnce(jsonResponse(200, { children: [CHILD] }));

    renderGate();

    expect(await screen.findByTestId('parent-child-card')).toHaveTextContent('Ali Valiyev');
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(calledUrls(fetchMock)).toEqual([ME_URL, EXCHANGE_URL]);
    expect(fetchCall(fetchMock, 1).init.body).toBeUndefined();
  });

  it('server bilan aloqa yo\'q (me 5xx) — exchange yo\'q, "Qayta urinish" → sessiya', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }))
      .mockResolvedValueOnce(jsonResponse(200, { role: 'PARENT', children: [CHILD] }));

    renderGate();

    expect(await screen.findByTestId('session-unavailable')).toBeInTheDocument();
    expect(calledUrls(fetchMock)).toEqual([ME_URL]);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Qayta urinish' }));

    expect(await screen.findByTestId('parent-child-card')).toHaveTextContent('Ali Valiyev');
    expect(calledUrls(fetchMock)).toEqual([ME_URL, ME_URL]);
  });

  it("sessiya yo'q — kod kiritish formasi; kod bilan kirish", async () => {
    fetchMock
      .mockResolvedValueOnce(NO_SESSION())
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', "Kirish kodi noto'g'ri"))
      .mockResolvedValueOnce(jsonResponse(200, { children: [CHILD] }));

    renderGate();

    const input = await screen.findByLabelText(/Kirish kodi/);
    const user = userEvent.setup();
    await user.type(input, OTHER_TOKEN);
    await user.click(screen.getByRole('button', { name: 'Kirish' }));

    expect(await screen.findByText('Ali Valiyev')).toBeInTheDocument();
    expect(requestJson(fetchCall(fetchMock, 2).init)).toEqual({
      tokens: [OTHER_TOKEN],
      merge: true,
    });
  });

  it("havoladagi token formati buzilgan — so'rov yuborilmaydi, xabar va body'siz exchange", async () => {
    navigation.search = new URLSearchParams({ t: 'short' });
    fetchMock
      .mockResolvedValueOnce(NO_SESSION())
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', "Kirish kodi noto'g'ri"));

    renderGate();

    expect(navigation.replace).toHaveBeenCalledWith('/parent');
    expect(await screen.findByText(/Havola noto'g'ri/)).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    expect(calledUrls(fetchMock)).toEqual([ME_URL, EXCHANGE_URL]);
    expect(fetchCall(fetchMock, 1).init.body).toBeUndefined();
  });
});
