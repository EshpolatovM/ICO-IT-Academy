import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PASSWORD_MISMATCH_MESSAGE, PASSWORD_POLICY_MESSAGE } from '@lms/shared';
import type { AuthUser } from '@lms/shared';

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
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { ChangePasswordForm } from './ChangePasswordForm';

const replace = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const STUDENT: AuthUser = {
  id: 's1',
  role: 'STUDENT',
  firstName: 'Dev',
  lastName: 'Student',
  studentCode: 'ST-10001',
  mustChangePassword: true,
};

async function fill(oldPassword: string, newPassword: string, confirm: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Joriy parol/), oldPassword);
  await user.type(screen.getByLabelText(/^Yangi parol\b/), newPassword);
  await user.type(screen.getByLabelText(/takrorlang/), confirm);
  await user.click(screen.getByRole('button', { name: 'Parolni saqlash' }));
}

describe('ChangePasswordForm', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetAuthStore();
    replace.mockReset();
    useAuthStore.getState().setSession('old-token', STUDENT);
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parollar mos kelmasa — xabar, so'rov yo'q", async () => {
    renderWithQuery(<ChangePasswordForm />);

    await fill('change_me1', 'Yangi1parol', 'Boshqa1parol');

    expect(await screen.findByText(PASSWORD_MISMATCH_MESSAGE)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parol siyosatiga mos kelmasa — @lms/shared xabari', async () => {
    renderWithQuery(<ChangePasswordForm />);

    await fill('change_me1', 'qisqa', 'qisqa');

    expect((await screen.findAllByText(PASSWORD_POLICY_MESSAGE)).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/^Yangi parol\b/)).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("muvaffaqiyat — yangi token store'ga, me yangilanadi, bosh sahifaga", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'new-token', expiresIn: 900 }))
      .mockResolvedValueOnce(jsonResponse(200, { ...STUDENT, mustChangePassword: false }));
    renderWithQuery(<ChangePasswordForm />);

    await fill('change_me1', 'Yangi1parol', 'Yangi1parol');

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/path');
    });
    expect(requestJson(fetchCall(fetchMock, 0).init)).toEqual({
      oldPassword: 'change_me1',
      newPassword: 'Yangi1parol',
    });
    expect(requestHeader(fetchCall(fetchMock, 1).init, 'Authorization')).toBe('Bearer new-token');
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'new-token',
      user: { mustChangePassword: false },
    });
  });

  it("noto'g'ri joriy parol (400 VALIDATION_ERROR) — xabar shu maydon ostida", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(400, 'VALIDATION_ERROR', "So'rov noto'g'ri", [
        { field: 'oldPassword', message: "Joriy parol noto'g'ri" },
      ]),
    );
    renderWithQuery(<ChangePasswordForm />);

    await fill('wrong-old1', 'Yangi1parol', 'Yangi1parol');

    expect(await screen.findByText("Joriy parol noto'g'ri")).toBeInTheDocument();
    expect(screen.getByLabelText(/Joriy parol/)).toHaveAttribute('aria-invalid', 'true');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it('urinishlar limiti (429 RATE_LIMITED) — formada umumiy xabar, sessiya saqlanadi', async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(429, 'RATE_LIMITED', "So'rovlar juda ko'p, birozdan keyin urinib ko'ring"),
    );
    renderWithQuery(<ChangePasswordForm />);

    await fill('wrong-old1', 'Yangi1parol', 'Yangi1parol');

    expect(await screen.findByRole('alert')).toHaveTextContent("So'rovlar juda ko'p");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'old-token',
    });
  });
});
