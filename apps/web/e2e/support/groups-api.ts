import { expect } from '@playwright/test';

import { GroupStatus } from '@lms/shared';
import type { AdminGroupDetail, LearningPathsResponse, LoginResponse } from '@lms/shared';

import { API, bearer, HTTP_CREATED, HTTP_OK } from './admin-api';

import type { APIRequestContext } from '@playwright/test';

/** `docs/12 §2.2` — guruhlar API'si (UI'dan tashqari tayyorlash, tekshirish va tozalash uchun). */
const HTTP_NO_CONTENT = 204;

/** `GET /admin/paths` — birinchi ilm yo'li id'si (guruh yaratish uchun; dev seed'da bor). */
export async function firstPathId(request: APIRequestContext, token: string): Promise<string> {
  const response = await request.get(`${API}/admin/paths`, { headers: bearer(token) });
  expect(response.status()).toBe(HTTP_OK);
  const [path] = ((await response.json()) as LearningPathsResponse).items;
  if (path === undefined) {
    throw new Error("Bazada ilm yo'li yo'q — guruh yaratib bo'lmaydi (dev seed kerak).");
  }
  return path.id;
}

export interface GroupInput {
  name: string;
  pathId: string;
  mentorId?: string | null;
}

/** `POST /admin/groups` (sanasiz). */
export async function createGroupViaApi(
  request: APIRequestContext,
  token: string,
  input: GroupInput,
): Promise<AdminGroupDetail> {
  const response = await request.post(`${API}/admin/groups`, {
    headers: bearer(token),
    data: { name: input.name, pathId: input.pathId, mentorId: input.mentorId ?? null },
  });
  expect(response.status()).toBe(HTTP_CREATED);
  return (await response.json()) as AdminGroupDetail;
}

/** `GET /admin/groups/:id`. */
export async function getGroupViaApi(
  request: APIRequestContext,
  token: string,
  groupId: string,
): Promise<AdminGroupDetail> {
  const response = await request.get(`${API}/admin/groups/${groupId}`, { headers: bearer(token) });
  expect(response.status()).toBe(HTTP_OK);
  return (await response.json()) as AdminGroupDetail;
}

/** `POST /admin/groups/:id/members`. */
export async function addMembersViaApi(
  request: APIRequestContext,
  token: string,
  groupId: string,
  studentIds: readonly string[],
): Promise<void> {
  const response = await request.post(`${API}/admin/groups/${groupId}/members`, {
    headers: bearer(token),
    data: { studentIds },
  });
  expect(response.status()).toBe(HTTP_OK);
}

/** `PATCH /admin/groups/:id { status }`. */
export async function setGroupStatusViaApi(
  request: APIRequestContext,
  token: string,
  groupId: string,
  status: GroupStatus,
): Promise<void> {
  const response = await request.patch(`${API}/admin/groups/${groupId}`, {
    headers: bearer(token),
    data: { status },
  });
  expect(response.status()).toBe(HTTP_OK);
}

/**
 * Test guruhini "zararsizlantirish": API'da guruhni o'chirish yo'q (docs/12 §2.2), shuning uchun
 * mentor olib tashlanadi (aks holda mentorni bazadan o'chirib bo'lmaydi — FK), faol a'zolar
 * chiqariladi va guruh arxivlanadi. Guruh yozuvining o'zi qoladi (hisobotga qarang).
 */
export async function retireGroupViaApi(
  request: APIRequestContext,
  token: string,
  groupId: string,
): Promise<void> {
  const group = await getGroupViaApi(request, token, groupId);
  if (group.mentor !== null) {
    const unassigned = await request.put(`${API}/admin/groups/${groupId}/mentor`, {
      headers: bearer(token),
      data: { mentorId: null },
    });
    expect(unassigned.status()).toBe(HTTP_OK);
  }
  for (const member of group.members) {
    const removed = await request.delete(`${API}/admin/groups/${groupId}/members/${member.id}`, {
      headers: bearer(token),
    });
    expect(removed.status()).toBe(HTTP_NO_CONTENT);
  }
  if (group.status === GroupStatus.ACTIVE) {
    await setGroupStatusViaApi(request, token, groupId, GroupStatus.ARCHIVED);
  }
}

/**
 * Yangi xodimning vaqtinchalik parolini API orqali almashtiradi (`mustChangePassword` tushadi),
 * shunda u UI'dan to'g'ridan-to'g'ri o'z paneliga kiradi.
 */
export async function activateStaffViaApi(
  request: APIRequestContext,
  phone: string,
  temporaryPassword: string,
  newPassword: string,
): Promise<void> {
  const login = await request.post(`${API}/auth/staff/login`, {
    data: { phone, password: temporaryPassword },
  });
  expect(login.status()).toBe(HTTP_OK);
  const { accessToken } = (await login.json()) as LoginResponse;
  const changed = await request.post(`${API}/auth/change-password`, {
    headers: bearer(accessToken),
    data: { oldPassword: temporaryPassword, newPassword },
  });
  expect(changed.status()).toBe(HTTP_OK);
}
