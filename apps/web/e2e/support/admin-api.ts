import { expect } from '@playwright/test';

import type {
  CreatedStaffResponse,
  CreatedStudentResponse,
  LoginResponse,
  PaginatedResult,
  StudentListItem,
} from '@lms/shared';

import { E2E_API_URL } from './e2e-env';

import type { E2eUser } from './e2e-users';
import type { APIRequestContext } from '@playwright/test';

/** E2E API (alohida port) — UI'dan tashqari tayyorlash va tekshirish uchun to'g'ridan-to'g'ri so'rovlar. */
export const API = `${E2E_API_URL}/api/v1`;
export const HTTP_OK = 200;
export const HTTP_CREATED = 201;

/** Xodim sifatida kirib, access token qaytaradi. */
export async function staffAccessToken(
  request: APIRequestContext,
  user: E2eUser,
  password: string,
): Promise<string> {
  const login = await request.post(`${API}/auth/staff/login`, {
    data: { phone: user.login, password },
  });
  expect(login.status()).toBe(HTTP_OK);
  return ((await login.json()) as LoginResponse).accessToken;
}

export function bearer(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export interface PersonName {
  firstName: string;
  lastName: string;
}

/** `POST /admin/students` — tizim yaratgan vaqtinchalik parol bilan. */
export async function createStudentViaApi(
  request: APIRequestContext,
  token: string,
  name: PersonName,
): Promise<CreatedStudentResponse> {
  const response = await request.post(`${API}/admin/students`, {
    headers: bearer(token),
    data: { ...name, groupId: null, password: null },
  });
  expect(response.status()).toBe(HTTP_CREATED);
  return (await response.json()) as CreatedStudentResponse;
}

/** `POST /admin/mentors`. */
export async function createMentorViaApi(
  request: APIRequestContext,
  token: string,
  data: PersonName & { phone: string },
): Promise<CreatedStaffResponse> {
  const response = await request.post(`${API}/admin/mentors`, {
    headers: bearer(token),
    data: { ...data, password: null },
  });
  expect(response.status()).toBe(HTTP_CREATED);
  return (await response.json()) as CreatedStaffResponse;
}

/** `GET /admin/students?q=` — qidiruv natijasidagi studentlar soni. */
export async function countStudents(
  request: APIRequestContext,
  token: string,
  q: string,
): Promise<number> {
  const response = await request.get(`${API}/admin/students`, {
    headers: bearer(token),
    params: { q },
  });
  expect(response.status()).toBe(HTTP_OK);
  return ((await response.json()) as PaginatedResult<StudentListItem>).total;
}

/** `POST /auth/student/login` javob kodi (yangi vaqtinchalik parol ishlashini tekshirish uchun). */
export async function studentLoginStatus(
  request: APIRequestContext,
  studentCode: string,
  password: string,
): Promise<number> {
  const response = await request.post(`${API}/auth/student/login`, {
    data: { studentCode, password },
  });
  return response.status();
}
