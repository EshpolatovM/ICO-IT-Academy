import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE } from '@lms/shared';

import {
  errorResponse,
  fetchCall,
  jsonResponse,
  mockFetch,
  requestHeader,
} from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';
import { resetParentSessionStore, useParentSessionStore } from '@/stores/parent-session.store';

import { ParentLogoutButton } from './ParentLogoutButton';

const LOGOUT_URL = '/api/v1/auth/parent/logout';

async function clickLogout() {
  renderWithQuery(<ParentLogoutButton />);
  await userEvent.setup().click(screen.getByRole('button', { name: 'Chiqish' }));
  await waitFor(() => {
    expect(useParentSessionStore.getState().status).toBe('none');
  });
}

describe('ParentLogoutButton', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetParentSessionStore();
    useParentSessionStore.getState().setStatus('active');
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POST /auth/parent/logout: CSRF sarlavhasi bilan, Bearer'siz, body'siz", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(204));

    await clickLogout();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe(LOGOUT_URL);
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.body).toBeUndefined();
    expect(requestHeader(init, CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
    expect(requestHeader(init, 'Authorization')).toBeNull();
  });

  it("xato bo'lsa ham qayta urinish (exchange) yo'q — forma ko'rsatiladi", async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', 'Sessiya yo`q'));

    await clickLogout();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchCall(fetchMock, 0).url).toBe(LOGOUT_URL);
  });
});
