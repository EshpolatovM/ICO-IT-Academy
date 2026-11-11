import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthUser } from '@lms/shared';

import { resetAuthStore, useAuthStore } from './auth.store';

const STUDENT: AuthUser = {
  id: 's1',
  role: 'STUDENT',
  firstName: 'Ali',
  lastName: 'Valiyev',
  studentCode: 'ST-10001',
  mustChangePassword: true,
};

describe('auth.store', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("boshlang'ich holat — unknown, token yo'q", () => {
    expect(useAuthStore.getState()).toMatchObject({
      status: 'unknown',
      accessToken: null,
      user: null,
      lastRole: null,
    });
  });

  it('setSession — authenticated, token, foydalanuvchi va oxirgi rol', () => {
    useAuthStore.getState().setSession('t1', STUDENT);

    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 't1',
      user: STUDENT,
      lastRole: 'STUDENT',
    });
  });

  it('setAccessToken — faqat token almashadi', () => {
    useAuthStore.getState().setSession('t1', STUDENT);
    useAuthStore.getState().setAccessToken('t2');

    expect(useAuthStore.getState()).toMatchObject({ accessToken: 't2', user: STUDENT });
  });

  it("clear — anonymous, token va foydalanuvchi o'chadi, oxirgi rol qoladi", () => {
    useAuthStore.getState().setSession('t1', STUDENT);
    useAuthStore.getState().clear();

    expect(useAuthStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
      lastRole: 'STUDENT',
    });
  });

  it('markUnavailable / retryRestore — faqat tiklash bosqichida (unknown ⇄ unavailable)', () => {
    const store = useAuthStore.getState();
    store.markUnavailable();
    expect(useAuthStore.getState().status).toBe('unavailable');
    store.retryRestore();
    expect(useAuthStore.getState().status).toBe('unknown');

    store.setSession('t1', STUDENT);
    store.markUnavailable();
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('token brauzer xotirasiga (localStorage/sessionStorage) yozilmaydi', () => {
    useAuthStore.getState().setSession('secret-token', STUDENT);

    const stored = [localStorage, sessionStorage].flatMap((storage) =>
      Array.from({ length: storage.length }, (_, index) => {
        const key = storage.key(index) ?? '';
        return `${key}=${storage.getItem(key) ?? ''}`;
      }),
    );
    expect(stored.join(';')).not.toContain('secret-token');
  });
});
