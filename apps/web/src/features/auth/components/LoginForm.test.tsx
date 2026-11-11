import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_FORMAT_MESSAGE } from '@lms/shared';

import { errorResponse, fetchCall, jsonResponse, mockFetch, requestJson } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { LoginForm } from './LoginForm';

const LOGIN_RESPONSE = {
  accessToken: 'access-1',
  expiresIn: 900,
  user: {
    id: 's1',
    role: 'STUDENT',
    firstName: 'Dev',
    lastName: 'Student',
    studentCode: 'ST-10001',
    mustChangePassword: true,
  },
};

async function fillStudentForm(code: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Student ID/), code);
  await user.type(screen.getByLabelText(/^Parol/), password);
  await user.click(screen.getByRole('button', { name: 'Kirish' }));
}

describe('LoginForm', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetAuthStore();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("bo'sh forma — validatsiya xabarlari, so'rov yuborilmaydi", async () => {
    renderWithQuery(<LoginForm kind="student" />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Kirish' }));

    expect(await screen.findAllByText(/Juda kichik/)).toHaveLength(2);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("staff: noto'g'ri telefon — @lms/shared xabari", async () => {
    renderWithQuery(<LoginForm kind="staff" />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/Telefon raqam/), '12345');
    await user.type(screen.getByLabelText(/^Parol/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Kirish' }));

    expect(await screen.findByText(PHONE_FORMAT_MESSAGE)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("muvaffaqiyatli login — kod katta harfga, sessiya store'ga yoziladi", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, LOGIN_RESPONSE));
    renderWithQuery(<LoginForm kind="student" />);

    await fillStudentForm('st-10001', 'change_me1');

    await waitFor(() => {
      expect(useAuthStore.getState().status).toBe('authenticated');
    });
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe('/api/v1/auth/student/login');
    expect(requestJson(init)).toEqual({
      studentCode: 'ST-10001',
      password: 'change_me1',
    });
    expect(useAuthStore.getState().accessToken).toBe('access-1');
  });

  it("401 — serverning umumiy xabari formada ko'rinadi", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(401, 'UNAUTHORIZED', "Login yoki parol noto'g'ri"),
    );
    renderWithQuery(<LoginForm kind="student" />);

    await fillStudentForm('ST-10001', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent("Login yoki parol noto'g'ri");
    expect(useAuthStore.getState().status).toBe('unknown');
  });

  it("429 — rate limit xabari ko'rinadi", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(429, 'RATE_LIMITED', "Juda ko'p urinish. Keyinroq qayta urinib ko'ring"),
    );
    renderWithQuery(<LoginForm kind="student" />);

    await fillStudentForm('ST-10001', 'wrong');

    expect(await screen.findByRole('alert')).toHaveTextContent("Juda ko'p urinish");
  });

  it("VALIDATION_ERROR details — server maydoni forma maydoniga bog'lanadi", async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(400, 'VALIDATION_ERROR', "So'rov noto'g'ri", [
        { field: 'studentCode', message: 'Student ID formati noto‘g‘ri' },
      ]),
    );
    renderWithQuery(<LoginForm kind="student" />);

    await fillStudentForm('ST-1', 'secret');

    const field = screen.getByLabelText(/Student ID/);
    expect(await screen.findByText('Student ID formati noto‘g‘ri')).toBeInTheDocument();
    expect(field).toHaveAttribute('aria-invalid', 'true');
  });
});
