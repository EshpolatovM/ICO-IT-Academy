import { describe, expect, it } from 'vitest';

import type { AccountRole, AuthUser } from '@lms/shared';

import { resolveAccess } from './resolve-access';

import type { AccessContext } from './resolve-access';

function user(role: AccountRole, mustChangePassword = false): AuthUser {
  return { id: 'u1', role, firstName: 'A', lastName: 'B', mustChangePassword };
}

function authenticated(role: AccountRole, mustChangePassword = false): AccessContext {
  return { status: 'authenticated', user: user(role, mustChangePassword), lastRole: role };
}

const ANONYMOUS: AccessContext = { status: 'anonymous', user: null, lastRole: null };

describe('resolveAccess', () => {
  it('sessiya tiklanmoqda — kutish', () => {
    const context: AccessContext = { status: 'unknown', user: null, lastRole: null };
    expect(resolveAccess('student', context)).toEqual({ type: 'wait' });
    expect(resolveAccess('guest', context)).toEqual({ type: 'wait' });
  });

  it.each([
    ['student', '/login'],
    ['mentor', '/login/staff'],
    ['admin', '/login/staff'],
  ] as const)('sessiyasiz %s zonasi → %s', (zone, to) => {
    expect(resolveAccess(zone, ANONYMOUS)).toEqual({ type: 'redirect', to });
  });

  it('sessiyasiz change-password → oxirgi rolning login sahifasi', () => {
    expect(resolveAccess('change-password', ANONYMOUS)).toEqual({ type: 'redirect', to: '/login' });
    expect(resolveAccess('change-password', { ...ANONYMOUS, lastRole: 'MENTOR' })).toEqual({
      type: 'redirect',
      to: '/login/staff',
    });
  });

  it('mehmon login sahifasida qoladi', () => {
    expect(resolveAccess('guest', ANONYMOUS)).toEqual({ type: 'allow' });
  });

  it.each([
    ['STUDENT', '/path'],
    ['MENTOR', '/mentor'],
    ['ADMIN', '/admin'],
    ['SUPER_ADMIN', '/admin'],
  ] as const)('kirgan %s login sahifasidan bosh sahifaga → %s', (role, to) => {
    expect(resolveAccess('guest', authenticated(role))).toEqual({ type: 'redirect', to });
  });

  it.each([
    ['student', 'STUDENT'],
    ['mentor', 'MENTOR'],
    ['admin', 'ADMIN'],
    ['admin', 'SUPER_ADMIN'],
  ] as const)('%s zonasi %s uchun ochiq', (zone, role) => {
    expect(resolveAccess(zone, authenticated(role))).toEqual({ type: 'allow' });
  });

  it("noto'g'ri rol → o'z bosh sahifasi", () => {
    expect(resolveAccess('admin', authenticated('STUDENT'))).toEqual({
      type: 'redirect',
      to: '/path',
    });
    expect(resolveAccess('student', authenticated('MENTOR'))).toEqual({
      type: 'redirect',
      to: '/mentor',
    });
    expect(resolveAccess('mentor', authenticated('SUPER_ADMIN'))).toEqual({
      type: 'redirect',
      to: '/admin',
    });
  });

  it('mustChangePassword → har qanday himoyalangan sahifadan /change-password', () => {
    const context = authenticated('STUDENT', true);
    expect(resolveAccess('student', context)).toEqual({ type: 'redirect', to: '/change-password' });
    expect(resolveAccess('admin', context)).toEqual({ type: 'redirect', to: '/change-password' });
    expect(resolveAccess('guest', context)).toEqual({ type: 'redirect', to: '/change-password' });
    expect(resolveAccess('change-password', context)).toEqual({ type: 'allow' });
  });

  it('parolni ixtiyoriy almashtirish ham ochiq', () => {
    expect(resolveAccess('change-password', authenticated('MENTOR'))).toEqual({ type: 'allow' });
  });
});
