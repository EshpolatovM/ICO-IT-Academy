import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCode } from '@lms/shared';
import type { AuthUser } from '@lms/shared';

import { errorResponse, jsonResponse, mockFetch } from '@/lib/testing/http';
import type { FetchMock } from '@/lib/testing/http';
import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { REFRESH_LOCK_NAME } from './refresh-lock';
import { REFRESH_SUPERSEDED_RETRY_DELAY_MS, refreshAccessToken } from './refresh-session';

const USER: AuthUser = {
  id: 'u1',
  role: 'STUDENT',
  firstName: 'Ali',
  lastName: 'Valiyev',
  studentCode: 'ST-10001',
  mustChangePassword: false,
};

const SUPERSEDED = (): Response =>
  errorResponse(401, ErrorCode.REFRESH_SUPERSEDED, "Sessiya boshqa so'rovda yangilangan");
const RENEWED = (token: string): Response =>
  jsonResponse(200, { accessToken: token, expiresIn: 900 });

type LockTask = () => Promise<unknown>;

/** Web Locks API mock'i: bitta nomli qulf, so'rovlar navbat bilan (haqiqiy eksklyuziv qulfdek). */
function installLocks() {
  let queue: Promise<unknown> = Promise.resolve();
  const request = vi.fn((_name: string, task: LockTask) => {
    const run = queue.then(task);
    queue = run.catch(() => undefined);
    return run;
  });
  Object.defineProperty(navigator, 'locks', {
    value: { request },
    configurable: true,
  });
  return request;
}

describe('refreshAccessToken', () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    resetAuthStore();
    useAuthStore.getState().setSession('old', USER);
    fetchMock = mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('Web Locks bor — refresh `lms-auth-refresh` qulfi ichida bajariladi', async () => {
    const request = installLocks();
    fetchMock.mockResolvedValueOnce(RENEWED('new'));

    await expect(refreshAccessToken()).resolves.toBe('new');

    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0]?.[0]).toBe(REFRESH_LOCK_NAME);
    expect(useAuthStore.getState().accessToken).toBe('new');
  });

  it("boshqa tab qulfni ushlab turganda — kutadi, qulf bo'shagach o'zi refresh qiladi", async () => {
    const request = installLocks();
    let releaseOtherTab: () => void = () => undefined;
    const otherTab = request(
      REFRESH_LOCK_NAME,
      () =>
        new Promise<void>((resolve) => {
          releaseOtherTab = resolve;
        }),
    );
    fetchMock.mockResolvedValueOnce(RENEWED('after-other-tab'));

    const refresh = refreshAccessToken();
    await Promise.resolve();
    expect(fetchMock).not.toHaveBeenCalled();

    releaseOtherTab();
    await otherTab;
    await expect(refresh).resolves.toBe('after-other-tab');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('REFRESH_SUPERSEDED — store tozalanmaydi, qisqa kutib bir marta qayta urinadi', async () => {
    installLocks();
    fetchMock.mockResolvedValueOnce(SUPERSEDED()).mockResolvedValueOnce(RENEWED('retried'));
    const startedAt = Date.now();

    await expect(refreshAccessToken()).resolves.toBe('retried');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(REFRESH_SUPERSEDED_RETRY_DELAY_MS - 1);
    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'retried',
    });
  });

  it('REFRESH_SUPERSEDED dan keyingi qayta urinish ham muvaffaqiyatsiz — store tozalanadi', async () => {
    fetchMock.mockResolvedValueOnce(SUPERSEDED()).mockResolvedValueOnce(SUPERSEDED());

    await expect(refreshAccessToken()).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('oddiy 401 (UNAUTHORIZED) — qayta urinishsiz logout', async () => {
    fetchMock.mockResolvedValueOnce(
      errorResponse(401, 'UNAUTHORIZED', 'Avtorizatsiya talab qilinadi'),
    );

    await expect(refreshAccessToken()).resolves.toBeNull();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('403 — store tozalanadi', async () => {
    fetchMock.mockResolvedValueOnce(errorResponse(403, 'FORBIDDEN', "Ruxsat yo'q"));

    await expect(refreshAccessToken()).resolves.toBeNull();

    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('5xx — xato tashlanadi, sessiya saqlanadi (M6)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('Bad Gateway', { status: 502 }));

    await expect(refreshAccessToken()).rejects.toMatchObject({
      status: 502,
      code: ErrorCode.SERVICE_UNAVAILABLE,
    });

    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', accessToken: 'old' });
  });

  it('tarmoq xatosi — xato tashlanadi, sessiya saqlanadi; keyingi chaqiruv yana urinadi', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(RENEWED('recovered'));

    await expect(refreshAccessToken()).rejects.toMatchObject({ status: 0 });
    expect(useAuthStore.getState()).toMatchObject({ status: 'authenticated', accessToken: 'old' });

    await expect(refreshAccessToken()).resolves.toBe('recovered');
  });
});
