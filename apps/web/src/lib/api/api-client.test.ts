import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode } from '@lms/shared';
import type { AuthUser } from '@lms/shared';

import {
  errorResponse,
  fetchCall,
  jsonResponse,
  mockFetch,
  requestUrl,
  requestHeader,
} from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { apiRequest } from './api-client';
import { ApiError } from './api-error';

const USER: AuthUser = {
  id: 'u1',
  role: 'MENTOR',
  firstName: 'Dev',
  lastName: 'Mentor',
  mustChangePassword: false,
};

const REFRESH_URL = '/api/v1/auth/refresh';

function isRefresh(input: RequestInfo | URL): boolean {
  return requestUrl(input) === REFRESH_URL;
}

describe('apiRequest', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetAuthStore();
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("base `/api/v1`, Bearer, cookie va JSON body bilan so'rov yuboradi", async () => {
    useAuthStore.getState().setSession('token-1', USER);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const result = await apiRequest<{ ok: boolean }>('/things', { method: 'POST', body: { a: 1 } });

    expect(result).toEqual({ ok: true });
    const { url, init } = fetchCall(fetchMock, 0);
    expect(url).toBe('/api/v1/things');
    expect(init.method).toBe('POST');
    expect(init.credentials).toBe('include');
    expect(init.body).toBe('{"a":1}');
    expect(requestHeader(init, 'Authorization')).toBe('Bearer token-1');
    expect(requestHeader(init, 'Content-Type')).toBe('application/json');
    expect(requestHeader(init, CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
  });

  it("FormData body o'zgarishsiz yuboriladi, JSON Content-Type qo'yilmaydi", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, {}));
    const form = new FormData();
    form.append('file', new Blob(['a,b']), 'a.csv');

    await apiRequest('/upload', { method: 'POST', body: form });

    const { init } = fetchCall(fetchMock, 0);
    expect(init.body).toBe(form);
    expect(requestHeader(init, 'Content-Type')).toBeNull();
    expect(requestHeader(init, CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
  });

  it('`auth: false` — Bearer yuborilmaydi', async () => {
    useAuthStore.getState().setSession('token-1', USER);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));

    await apiRequest('/auth/staff/login', { method: 'POST', body: {}, auth: false });

    expect(requestHeader(fetchCall(fetchMock, 0).init, 'Authorization')).toBeNull();
  });

  it('204 javobi — undefined', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('xato javobini tiplangan ApiError ga aylantiradi (code, status, details)', async () => {
    const details = [{ field: 'phone', message: "Noto'g'ri" }];
    fetchMock.mockResolvedValueOnce(errorResponse(400, 'VALIDATION_ERROR', 'Xato', details));

    const error = await apiRequest('/x').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Xato' });
    expect((error as ApiError).fieldErrors).toEqual(details);
  });

  it('body formati buzilgan xato — HTTP holatidan kod', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>', { status: 429 }));

    await expect(apiRequest('/x')).rejects.toMatchObject({
      status: 429,
      code: ErrorCode.RATE_LIMITED,
    });
  });

  it("API o'chiq — proxy'ning 5xx matni SERVICE_UNAVAILABLE bo'ladi", async () => {
    fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));

    await expect(apiRequest('/x')).rejects.toMatchObject({
      status: 500,
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });
  });

  it('tarmoq xatosi — status 0, SERVICE_UNAVAILABLE', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiRequest('/x')).rejects.toMatchObject({
      status: 0,
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });
  });

  it("401 → bitta refresh (X-Requested-With bilan) → so'rov yangi token bilan qayta yuboriladi", async () => {
    useAuthStore.getState().setSession('old', USER);
    fetchMock
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'new', expiresIn: 900 }))
      .mockResolvedValueOnce(jsonResponse(200, { value: 42 }));

    const result = await apiRequest<{ value: number }>('/data');

    expect(result).toEqual({ value: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    const refresh = fetchCall(fetchMock, 1);
    expect(refresh.url).toBe(REFRESH_URL);
    expect(refresh.init.method).toBe('POST');
    expect(refresh.init.credentials).toBe('include');
    expect(requestHeader(refresh.init, CSRF_HEADER_NAME)).toBe(CSRF_HEADER_VALUE);
    expect(requestHeader(refresh.init, 'Authorization')).toBeNull();
    expect(requestHeader(fetchCall(fetchMock, 2).init, 'Authorization')).toBe('Bearer new');
    expect(useAuthStore.getState().accessToken).toBe('new');
  });

  it("parallel 401'lar BITTA refresh so'rovini kutadi", async () => {
    useAuthStore.getState().setSession('old', USER);
    let resolveRefresh: (response: Response) => void = () => undefined;
    fetchMock.mockImplementation((input, init) => {
      if (isRefresh(input)) {
        return new Promise<Response>((resolve) => {
          resolveRefresh = resolve;
        });
      }
      const auth = new Headers(init?.headers).get('Authorization');
      return Promise.resolve(
        auth === 'Bearer new'
          ? jsonResponse(200, { path: requestUrl(input) })
          : errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'),
      );
    });

    const requests = Promise.all([apiRequest('/a'), apiRequest('/b'), apiRequest('/c')]);
    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.filter(([input]) => isRefresh(input))).toHaveLength(1);
    });
    resolveRefresh(jsonResponse(200, { accessToken: 'new', expiresIn: 900 }));

    await expect(requests).resolves.toEqual([
      { path: '/api/v1/a' },
      { path: '/api/v1/b' },
      { path: '/api/v1/c' },
    ]);
    expect(fetchMock.mock.calls.filter(([input]) => isRefresh(input))).toHaveLength(1);
  });

  it('refresh muvaffaqiyatsiz → store tozalanadi (anonymous) va 401 xatosi tashlanadi', async () => {
    useAuthStore.getState().setSession('old', USER);
    fetchMock
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'))
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'));

    await expect(apiRequest('/data')).rejects.toMatchObject({ status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const state = useAuthStore.getState();
    expect(state).toMatchObject({ status: 'anonymous', accessToken: null, user: null });
    expect(state.lastRole).toBe('MENTOR');
  });

  it("refresh vaqtinchalik xato (5xx) — so'rov SERVICE_UNAVAILABLE bilan tushadi, sessiya saqlanadi", async () => {
    useAuthStore.getState().setSession('old', USER);
    fetchMock
      .mockResolvedValueOnce(errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'))
      .mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    await expect(apiRequest('/data')).rejects.toMatchObject({
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', accessToken: 'old' });
  });

  it("token'siz (yoki `auth: false`) so'rovdagi 401 — refresh qilinmaydi", async () => {
    fetchMock.mockResolvedValue(errorResponse(401, 'UNAUTHORIZED', "Login yoki parol noto'g'ri"));

    await expect(apiRequest('/auth/student/login', { auth: false })).rejects.toMatchObject({
      status: 401,
      message: "Login yoki parol noto'g'ri",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
