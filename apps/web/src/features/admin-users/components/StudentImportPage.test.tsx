import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES,
  STUDENT_IMPORT_DEFAULT_MAX_ROWS,
  STUDENT_IMPORT_FILE_FIELD,
} from '@lms/shared';

import { errorResponse, fetchCall, jsonResponse, mockFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { renderWithQuery } from '@/lib/testing/render';

import { StudentImportPage } from './StudentImportPage';

const IMPORT_URL = '/api/v1/admin/students/import';
const RESULT = {
  count: 1,
  students: [
    {
      id: 's9',
      studentCode: 'ST-10246',
      firstName: 'Ali',
      lastName: 'Valiyev',
      groupName: 'FE-12',
      temporaryPassword: 'q7Lm2xPa9z',
    },
  ],
};

async function uploadCsv() {
  const user = userEvent.setup();
  renderWithQuery(<StudentImportPage />);
  const submit = screen.getByRole('button', { name: 'Import qilish' });
  expect(submit).toBeDisabled();
  const file = new File(['firstName,lastName\nAli,Valiyev'], 'students.csv', { type: 'text/csv' });
  await user.upload(screen.getByLabelText(/CSV fayl/), file);
  await user.click(submit);
  return { user, file };
}

describe('StudentImportPage', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('muvaffaqiyat: multipart yuboriladi, yaratilganlar va parollar jadvali; "Yangi import" tozalaydi', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, RESULT));
    const { user, file } = await uploadCsv();

    expect(await screen.findByText('1 ta student yaratildi.')).toBeInTheDocument();
    expect(screen.getByText('q7Lm2xPa9z')).toBeInTheDocument();
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe(IMPORT_URL);
    expect((init.body as FormData).get(STUDENT_IMPORT_FILE_FIELD)).toStrictEqual(file);

    await user.click(screen.getByRole('button', { name: 'Yangi import' }));
    expect(screen.queryByText('q7Lm2xPa9z')).not.toBeInTheDocument();
  });

  it('400 VALIDATION_ERROR — qatorlar jadvali (row 0 — "Fayl")', async () => {
    fetchMock.mockResolvedValue(
      errorResponse(
        400,
        'VALIDATION_ERROR',
        'CSV faylda xatolar bor — hech bir student yaratilmadi',
        [
          { row: 3, field: 'lastName', message: 'Majburiy maydon' },
          { row: 0, field: '', message: "Qatorlar juda ko'p" },
        ],
      ),
    );
    await uploadCsv();

    expect(await screen.findByText(/hech bir student yaratilmadi/)).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Majburiy maydon' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Fayl' })).toBeInTheDocument();
  });

  it('413 PAYLOAD_TOO_LARGE — xabar va maslahat', async () => {
    fetchMock.mockResolvedValue(errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Fayl hajmi juda katta'));
    await uploadCsv();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Fayl hajmi juda katta.*kichik faylga/);
    });
  });

  it("hint'da standart chegaralar: fayl hajmi va qatorlar soni", () => {
    renderWithQuery(<StudentImportPage />);

    const hint = screen.getByText(/Standart chegaralar/);
    expect(hint).toHaveTextContent('1 MiB');
    expect(hint).toHaveTextContent(String(STUDENT_IMPORT_DEFAULT_MAX_ROWS));
  });

  it("standart chegaradan katta fayl — so'rov yuborilmaydi, ogohlantirish chiqadi", async () => {
    const user = userEvent.setup();
    renderWithQuery(<StudentImportPage />);
    const big = new File([new Uint8Array(STUDENT_IMPORT_DEFAULT_MAX_FILE_BYTES + 1)], 'big.csv', {
      type: 'text/csv',
    });
    await user.upload(screen.getByLabelText(/CSV fayl/), big);

    const warning = screen.getByRole('alert');
    expect(warning).toHaveTextContent(/1 MiB dan katta/);
    expect(warning).toHaveTextContent(/Server chegarasi boshqacha/i);
    const submit = screen.getByRole('button', { name: 'Import qilish' });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
