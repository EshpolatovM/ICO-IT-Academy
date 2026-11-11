import { randomUUID } from 'node:crypto';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, Role } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { API, http, TEST_PASSWORD } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import { ALL_ACTORS, RbacActors } from './support/rbac-actors.js';
import { GROUP_CASES } from './support/rbac-group-cases.js';
import {
  accountOnly,
  adminsOnly,
  FORBIDDEN,
  MCP_BLOCKED,
  NOT_FOUND,
  ok,
  resolved,
  row,
  staffStudentAccess,
  targetStudent,
  UNAUTHORIZED,
} from './support/rbac-matrix.js';
import { USER_MANAGEMENT_CASES } from './support/rbac-user-cases.js';

import type { AuthFixtures } from './support/auth-fixtures.js';
import type { Actor } from './support/rbac-actors.js';
import type { EndpointCase, RequestSpec } from './support/rbac-matrix.js';
import type request from 'supertest';

/**
 * RBAC matritsasi — 1-bosqich, 2.2 va 2.3 (docs/01 §2.1, docs/02 §7, docs/12 §1, §2, §16): har bir endpoint × har bir
 * aktyor → kutilgan status (va xato kodi). Global guard tartibi: autentifikatsiya (401) →
 * `PASSWORD_CHANGE_REQUIRED` (403) → `@Roles` (403) → ota-ona faqat o'qish (403) → `@StudentScope`.
 * Mentor uchun student endpointlari — guruh scope'i orqali (begona student — 404).
 * Har bir katak o'z aktyori va nishon yozuvlari bilan ishlaydi (natijalar bir-biriga ta'sir qilmaydi).
 */

const NEW_PASSWORD = 'Yangi$Parol9';

async function tokenPath(actor: Actor, actors: RbacActors): Promise<string> {
  const studentId = await targetStudent(actor, actors);
  return `/students/${studentId}/parent-tokens/${await actors.issueToken(studentId)}`;
}

function staffResetOf(role: AccountRole) {
  return async (_actor: Actor, actors: RbacActors): Promise<RequestSpec> => ({
    method: 'post',
    path: `/staff/${(await actors.newUser(role)).id}/reset-password`,
  });
}

const FOUNDATION_CASES: EndpointCase[] = [
  {
    endpoint: 'GET /health',
    build: resolved({ method: 'get', path: '/health' }),
    expected: row(ok(200), ok(200), ok(200), ok(200), ok(200), ok(200), ok(200)),
  },
  {
    endpoint: 'POST /auth/parent/logout',
    build: resolved({ method: 'post', path: '/auth/parent/logout', csrf: true }),
    expected: row(ok(204), ok(204), ok(204), ok(204), ok(204), ok(204), ok(204)),
  },
  {
    endpoint: 'GET /auth/me',
    build: resolved({ method: 'get', path: '/auth/me' }),
    expected: row(UNAUTHORIZED, ok(200), ok(200), ok(200), ok(200), ok(200), ok(200)),
  },
  {
    endpoint: 'POST /auth/logout',
    build: resolved({ method: 'post', path: '/auth/logout', csrf: true }),
    expected: row(UNAUTHORIZED, ok(204), ok(204), ok(204), ok(204), ok(204), ok(204)),
  },
  {
    endpoint: 'POST /auth/change-password',
    build: resolved({
      method: 'post',
      path: '/auth/change-password',
      body: { oldPassword: TEST_PASSWORD, newPassword: NEW_PASSWORD },
    }),
    expected: row(UNAUTHORIZED, ok(200), ok(200), ok(200), ok(200), ok(200), FORBIDDEN),
  },
  {
    endpoint: 'GET /auth/sessions',
    build: resolved({ method: 'get', path: '/auth/sessions' }),
    expected: accountOnly(ok(200)),
  },
  {
    endpoint: "DELETE /auth/sessions/:id (o'z sessiyasi)",
    build: async (actor, actors) => ({
      method: 'delete',
      path: `/auth/sessions/${actor.user ? await actors.sessionIdOf(actor.user.id) : randomUUID()}`,
    }),
    expected: accountOnly(ok(204)),
  },
  {
    endpoint: 'GET /students/:id/parent-tokens',
    build: async (actor, actors) => ({
      method: 'get',
      path: `/students/${await targetStudent(actor, actors)}/parent-tokens`,
    }),
    expected: staffStudentAccess(ok(200)),
  },
  {
    endpoint: 'POST /students/:id/parent-tokens',
    build: async (actor, actors) => ({
      method: 'post',
      path: `/students/${await targetStudent(actor, actors)}/parent-tokens`,
      body: { label: 'Otasi' },
    }),
    expected: staffStudentAccess(ok(201)),
  },
  {
    endpoint: 'DELETE /students/:id/parent-tokens/:tokenId',
    build: async (actor, actors) => ({ method: 'delete', path: await tokenPath(actor, actors) }),
    expected: staffStudentAccess(ok(204)),
  },
  {
    endpoint: 'POST /students/:id/parent-tokens/:tokenId/regenerate',
    build: async (actor, actors) => ({
      method: 'post',
      path: `${await tokenPath(actor, actors)}/regenerate`,
    }),
    expected: staffStudentAccess(ok(201)),
  },
  {
    endpoint: 'POST /students/:id/reset-password',
    build: async (actor, actors) => ({
      method: 'post',
      path: `/students/${await targetStudent(actor, actors)}/reset-password`,
    }),
    expected: staffStudentAccess(ok(200)),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: MENTOR)',
    build: staffResetOf(Role.MENTOR),
    expected: adminsOnly(ok(200)),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: ADMIN)',
    build: staffResetOf(Role.ADMIN),
    expected: row(UNAUTHORIZED, ok(200), FORBIDDEN, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: SUPER_ADMIN)',
    build: staffResetOf(Role.SUPER_ADMIN),
    expected: adminsOnly(FORBIDDEN),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: STUDENT)',
    build: staffResetOf(Role.STUDENT),
    expected: adminsOnly(NOT_FOUND),
  },
  {
    endpoint: "POST /staff/:id/reset-password (nishon: o'zi)",
    build: (actor) =>
      Promise.resolve({
        method: 'post',
        path: `/staff/${actor.user?.id ?? randomUUID()}/reset-password`,
      }),
    expected: adminsOnly(FORBIDDEN),
  },
];

const CASES: EndpointCase[] = [...FOUNDATION_CASES, ...USER_MANAGEMENT_CASES, ...GROUP_CASES];

/** Muvaffaqiyatli yaratish javobidagi foydalanuvchilar (`id`, `students[].id`) tozalanadi. */
function trackCreatedUsers(fixtures: AuthFixtures, response: request.Response): void {
  const body = response.body as { id?: string; students?: { id: string }[] };
  const ids = [body.id, ...(body.students ?? []).map((student) => student.id)];
  ids.forEach((id) => {
    if (id) {
      fixtures.track(id);
    }
  });
}

const CELLS = CASES.flatMap((testCase) =>
  ALL_ACTORS.map((actor) => ({
    ...testCase,
    actor,
    status: testCase.expected[actor].status,
  })),
);

describe('RBAC matritsasi — 1-bosqich, 2.2 va 2.3 endpointlari (e2e)', () => {
  const context = useE2eContext();
  let actors: RbacActors;

  beforeAll(() => {
    actors = new RbacActors(context.app, context.fixtures);
  });

  function send(spec: RequestSpec, actor: Actor): request.Test {
    const agent = http(context.app);
    const base = actor.authorize(agent[spec.method](`${API}${spec.path}`));
    const withCsrf = spec.csrf ? base.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE) : base;
    if (spec.attach) {
      return withCsrf.attach(spec.attach.field, spec.attach.content, spec.attach.filename);
    }
    return spec.body ? withCsrf.send(spec.body) : withCsrf;
  }

  it.each(CELLS)('$endpoint — $actor → $status', async (cell) => {
    const { build, expected, actor: kind } = cell;
    const actor = await actors.create(kind);
    const spec = await build(actor, actors);
    const response = await send(spec, actor);
    if (cell.createsUsers) {
      trackCreatedUsers(context.fixtures, response);
    }
    const createdGroupId = (response.body as { id?: string } | undefined)?.id;
    if (cell.createsGroup && createdGroupId) {
      context.fixtures.trackGroup(createdGroupId);
    }

    const want = expected[kind];
    const body = response.body as { error?: { code?: string } } | undefined;
    expect({ status: response.status, code: want.code ? body?.error?.code : undefined }).toEqual({
      status: want.status,
      code: want.code,
    });
  });
});
