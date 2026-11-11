import { randomUUID } from 'node:crypto';

import { Role, STUDENT_IMPORT_FILE_FIELD, UserStatus } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { ActorKind } from './rbac-actors.js';
import {
  adminsOnly,
  CREATED,
  FORBIDDEN,
  MCP_BLOCKED,
  NOT_FOUND,
  OK,
  resolved,
  row,
  superAdminOnly,
  UNAUTHORIZED,
} from './rbac-matrix.js';
import { randomTestPhone } from './test-users.js';

import type { Actor, RbacActors } from './rbac-actors.js';
import type { EndpointCase, RequestSpec } from './rbac-matrix.js';

/**
 * 2.2 — foydalanuvchilarni boshqarish endpointlari (docs/12 §2, docs/01 §2.1, S-07 A, S-11 A):
 * adminlar — faqat SA; mentor va studentlar — SA va A; o'z akkauntini o'zgartirish — 403;
 * boshqa roldagi nishon (SUPER_ADMIN ham) — 404.
 */

const newStaff = () => ({ phone: randomTestPhone(), firstName: 'E2E', lastName: 'Rbac' });

const IMPORT_CSV = Buffer.from('firstName,lastName\nE2E,RbacImport\n', 'utf8');

function targetOf(basePath: string, role: AccountRole, body: object = { lastName: 'Rbac' }) {
  return async (_actor: Actor, actors: RbacActors): Promise<RequestSpec> => ({
    method: 'patch',
    path: `${basePath}/${(await actors.newUser(role)).id}`,
    body,
  });
}

function getOf(basePath: string, role: AccountRole) {
  return async (_actor: Actor, actors: RbacActors): Promise<RequestSpec> => ({
    method: 'get',
    path: `${basePath}/${(await actors.newUser(role)).id}`,
  });
}

/** O'zini deaktivatsiya: SA — `/super/admins/:o'zi`, qolganlar — `/admin/mentors/:o'zi`. */
const selfDeactivation = (actor: Actor): Promise<RequestSpec> =>
  Promise.resolve({
    method: 'patch',
    path: `${actor.kind === ActorKind.SUPER_ADMIN ? '/super/admins' : '/admin/mentors'}/${actor.user?.id ?? randomUUID()}`,
    body: { status: UserStatus.INACTIVE },
  });

export const USER_MANAGEMENT_CASES: EndpointCase[] = [
  {
    endpoint: 'GET /super/admins',
    build: resolved({ method: 'get', path: '/super/admins' }),
    expected: superAdminOnly(OK),
  },
  {
    endpoint: 'POST /super/admins',
    build: () => Promise.resolve({ method: 'post', path: '/super/admins', body: newStaff() }),
    expected: superAdminOnly(CREATED),
    createsUsers: true,
  },
  {
    endpoint: 'PATCH /super/admins/:id (nishon: ADMIN)',
    build: targetOf('/super/admins', Role.ADMIN),
    expected: superAdminOnly(OK),
  },
  {
    endpoint: 'PATCH /super/admins/:id (nishon: SUPER_ADMIN)',
    build: targetOf('/super/admins', Role.SUPER_ADMIN),
    expected: superAdminOnly(NOT_FOUND),
  },
  {
    endpoint: 'GET /admin/mentors',
    build: resolved({ method: 'get', path: '/admin/mentors' }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'POST /admin/mentors',
    build: () => Promise.resolve({ method: 'post', path: '/admin/mentors', body: newStaff() }),
    expected: adminsOnly(CREATED),
    createsUsers: true,
  },
  {
    endpoint: 'GET /admin/mentors/:id',
    build: getOf('/admin/mentors', Role.MENTOR),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PATCH /admin/mentors/:id',
    build: targetOf('/admin/mentors', Role.MENTOR),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PATCH /admin/mentors/:id (nishon: ADMIN)',
    build: targetOf('/admin/mentors', Role.ADMIN, { status: UserStatus.INACTIVE }),
    expected: adminsOnly(NOT_FOUND),
  },
  {
    endpoint: "PATCH (o'zini deaktivatsiya)",
    build: selfDeactivation,
    expected: row(UNAUTHORIZED, FORBIDDEN, FORBIDDEN, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN),
  },
  {
    endpoint: 'GET /admin/students',
    build: resolved({ method: 'get', path: '/admin/students' }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'POST /admin/students',
    build: resolved({
      method: 'post',
      path: '/admin/students',
      body: { firstName: 'E2E', lastName: 'Rbac' },
    }),
    expected: adminsOnly(CREATED),
    createsUsers: true,
  },
  {
    endpoint: 'POST /admin/students/import',
    build: resolved({
      method: 'post',
      path: '/admin/students/import',
      attach: { field: STUDENT_IMPORT_FILE_FIELD, content: IMPORT_CSV, filename: 'students.csv' },
    }),
    expected: adminsOnly(CREATED),
    createsUsers: true,
  },
  {
    endpoint: 'GET /admin/students/:id',
    build: getOf('/admin/students', Role.STUDENT),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PATCH /admin/students/:id',
    build: targetOf('/admin/students', Role.STUDENT),
    expected: adminsOnly(OK),
  },
];
