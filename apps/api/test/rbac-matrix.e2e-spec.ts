import { randomUUID } from 'node:crypto';

import { CSRF_HEADER_NAME, CSRF_HEADER_VALUE, ErrorCode, Role } from '@lms/shared';
import type { AccountRole } from '@lms/shared';

import { API, http, TEST_PASSWORD } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import { ALL_ACTORS, RbacActors } from './support/rbac-actors.js';

import type { Actor, ActorKind } from './support/rbac-actors.js';
import type request from 'supertest';

/**
 * 1-bosqich RBAC matritsasi (docs/01 §2.1, docs/02 §7, docs/12 §1, §16): har bir endpoint × har bir
 * aktyor → kutilgan status (va xato kodi). Global guard tartibi: autentifikatsiya (401) →
 * `PASSWORD_CHANGE_REQUIRED` (403) → `@Roles` (403) → ota-ona faqat o'qish (403) → `@StudentScope`.
 * Mentor uchun student endpointlari hozir 403 (guruhlar 2-bosqichda — 1.6 qarori).
 * Har bir katak o'z aktyori va nishon yozuvlari bilan ishlaydi (natijalar bir-biriga ta'sir qilmaydi).
 */

interface Expectation {
  status: number;
  code?: ErrorCode;
}

interface RequestSpec {
  method: 'get' | 'post' | 'delete';
  path: string;
  body?: object;
  csrf?: boolean;
}

interface EndpointCase {
  endpoint: string;
  build: (actor: Actor, actors: RbacActors) => Promise<RequestSpec>;
  expected: Record<ActorKind, Expectation>;
}

const NEW_PASSWORD = 'Yangi$Parol9';

const UNAUTHORIZED: Expectation = { status: 401, code: ErrorCode.UNAUTHORIZED };
const FORBIDDEN: Expectation = { status: 403, code: ErrorCode.FORBIDDEN };
const MCP_BLOCKED: Expectation = { status: 403, code: ErrorCode.PASSWORD_CHANGE_REQUIRED };
const NOT_FOUND: Expectation = { status: 404, code: ErrorCode.NOT_FOUND };
const ok = (status: number): Expectation => ({ status });

/** Ustunlar tartibi: anonim, SA, A, M, S, S(mcp), P. */
function row(...cells: [Expectation, ...Expectation[]]): Record<ActorKind, Expectation> {
  return Object.fromEntries(ALL_ACTORS.map((kind, index) => [kind, cells[index]])) as Record<
    ActorKind,
    Expectation
  >;
}

/** SA A M S — akkauntli rollar (ota-ona — 403, mcp=true — 403 PASSWORD_CHANGE_REQUIRED). */
const accountOnly = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, success, success, MCP_BLOCKED, FORBIDDEN);

/** SA A (+ M guruh bilan, 2-bosqichgacha 403) — xodimning studentga oid amallari. */
const staffStudentAccess = (success: Expectation) =>
  row(UNAUTHORIZED, success, success, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN);

/** Studentga oid endpoint nishoni: student — o'zi, ota-ona — farzandi, qolganlar — yangi student. */
async function targetStudent(actor: Actor, actors: RbacActors): Promise<string> {
  return actor.ownStudentId ?? (await actors.newUser(Role.STUDENT)).id;
}

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

const resolved = (spec: RequestSpec) => () => Promise.resolve(spec);

const CASES: EndpointCase[] = [
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
    build: resolved({ method: 'post', path: '/auth/logout' }),
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
    expected: staffStudentAccess(ok(200)),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: ADMIN)',
    build: staffResetOf(Role.ADMIN),
    expected: row(UNAUTHORIZED, ok(200), FORBIDDEN, FORBIDDEN, FORBIDDEN, MCP_BLOCKED, FORBIDDEN),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: SUPER_ADMIN)',
    build: staffResetOf(Role.SUPER_ADMIN),
    expected: staffStudentAccess(FORBIDDEN),
  },
  {
    endpoint: 'POST /staff/:id/reset-password (nishon: STUDENT)',
    build: staffResetOf(Role.STUDENT),
    expected: staffStudentAccess(NOT_FOUND),
  },
  {
    endpoint: "POST /staff/:id/reset-password (nishon: o'zi)",
    build: (actor) =>
      Promise.resolve({
        method: 'post',
        path: `/staff/${actor.user?.id ?? randomUUID()}/reset-password`,
      }),
    expected: staffStudentAccess(FORBIDDEN),
  },
];

const CELLS = CASES.flatMap((testCase) =>
  ALL_ACTORS.map((actor) => ({
    ...testCase,
    actor,
    status: testCase.expected[actor].status,
  })),
);

describe('RBAC matritsasi — 1-bosqich endpointlari (e2e)', () => {
  const context = useE2eContext();
  let actors: RbacActors;

  beforeAll(() => {
    actors = new RbacActors(context.app, context.fixtures);
  });

  function send(spec: RequestSpec, actor: Actor): request.Test {
    const agent = http(context.app);
    const base = actor.authorize(agent[spec.method](`${API}${spec.path}`));
    const withCsrf = spec.csrf ? base.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE) : base;
    return spec.body ? withCsrf.send(spec.body) : withCsrf;
  }

  it.each(CELLS)('$endpoint — $actor → $status', async ({ build, expected, actor: kind }) => {
    const actor = await actors.create(kind);
    const spec = await build(actor, actors);
    const response = await send(spec, actor);

    const want = expected[kind];
    const body = response.body as { error?: { code?: string } } | undefined;
    expect({ status: response.status, code: want.code ? body?.error?.code : undefined }).toEqual({
      status: want.status,
      code: want.code,
    });
  });
});
