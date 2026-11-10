import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AuthUser } from '@lms/shared';

import { fetchCall, jsonResponse, mockFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { AuthGuard } from './AuthGuard';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const MENTOR: AuthUser = {
  id: 'm1',
  role: 'MENTOR',
  firstName: 'Dev',
  lastName: 'Mentor',
  phone: '+998900000001',
  mustChangePassword: false,
};

describe('AuthGuard', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetAuthStore();
    replace.mockReset();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sessiya tiklanguncha Spinner, refresh + me dan keyin kontent', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'restored', expiresIn: 900 }))
      .mockResolvedValueOnce(jsonResponse(200, MENTOR));

    render(
      <AuthGuard area="mentor">
        <p>Mentor kontenti</p>
      </AuthGuard>,
    );

    expect(screen.getByTestId('full-page-spinner')).toBeInTheDocument();
    expect(await screen.findByText('Mentor kontenti')).toBeInTheDocument();
    expect(fetchCall(fetchMock, 0).url).toBe('/api/v1/auth/refresh');
    expect(fetchCall(fetchMock, 1).url).toBe('/api/v1/auth/me');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(replace).not.toHaveBeenCalled();
  });

  it('sessiya tiklanmasa — zonaning login sahifasiga', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { error: { code: 'UNAUTHORIZED' } }));

    render(
      <AuthGuard area="admin">
        <p>Admin kontenti</p>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/login/staff');
    });
    expect(screen.queryByText('Admin kontenti')).not.toBeInTheDocument();
  });

  it("noto'g'ri rol — o'z bosh sahifasiga", async () => {
    useAuthStore.getState().setSession('t', MENTOR);

    render(
      <AuthGuard area="student">
        <p>Student kontenti</p>
      </AuthGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/mentor');
    });
    expect(screen.queryByText('Student kontenti')).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
