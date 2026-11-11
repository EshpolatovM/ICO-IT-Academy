import { HttpStatus } from '@nestjs/common';

import { Role } from '@lms/shared';

import {
  adminsOnly,
  CREATED,
  FORBIDDEN,
  MCP_BLOCKED,
  mentorOnly,
  NOT_FOUND,
  OK,
  ok,
  resolved,
  row,
  UNAUTHORIZED,
} from './rbac-matrix.js';

import type { Actor, RbacActors } from './rbac-actors.js';
import type { EndpointCase, RequestSpec } from './rbac-matrix.js';

/**
 * 2.3 — guruhlar (docs/12 §2: SA A), yo'llar ro'yxati (SA A) va mentor sahifasi (docs/12 §12: M).
 * Mentor endpointlarida nishon — aktyorning o'z guruhi (mentor bo'lsa), boshqalar uchun — begona.
 */

const NO_CONTENT = ok(HttpStatus.NO_CONTENT);

function groupPath(suffix = '') {
  return async (_actor: Actor, actors: RbacActors): Promise<RequestSpec> => ({
    method: 'get',
    path: `/admin/groups/${(await actors.newGroup()).id}${suffix}`,
  });
}

/** Aktyor mentor bo'lsa — uning guruhi (bitta faol a'zo bilan), aks holda mentorsiz guruh. */
async function ownGroup(actor: Actor, actors: RbacActors) {
  const student = await actors.newUser(Role.STUDENT);
  const mentorId = actor.user?.role === Role.MENTOR ? actor.user.id : null;
  const group = await actors.newGroup({ mentorId, studentIds: [student.id] });
  return { group, studentId: student.id };
}

/** Boshqa mentorning guruhi (bitta faol a'zo bilan) — mentor aktyor uchun begona (IDOR). */
async function foreignGroup(actors: RbacActors) {
  const [mentor, student] = [await actors.newUser(Role.MENTOR), await actors.newUser(Role.STUDENT)];
  return actors.newGroup({ mentorId: mentor.id, studentIds: [student.id] });
}

export const GROUP_CASES: EndpointCase[] = [
  {
    // M4 (docs/12 §3: "GET: M ham") — mentor ham o'qiydi; yozish endpointlari yo'q.
    endpoint: 'GET /admin/paths',
    build: resolved({ method: 'get', path: '/admin/paths' }),
    expected: row(UNAUTHORIZED, OK, OK, OK, FORBIDDEN, MCP_BLOCKED, FORBIDDEN),
  },
  {
    endpoint: 'GET /admin/groups',
    build: resolved({ method: 'get', path: '/admin/groups' }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'POST /admin/groups',
    build: async (_actor, actors) => ({
      method: 'post',
      path: '/admin/groups',
      body: { name: 'E2E-Rbac', pathId: (await actors.newGroup()).pathId },
    }),
    expected: adminsOnly(CREATED),
    createsGroup: true,
  },
  { endpoint: 'GET /admin/groups/:id', build: groupPath(), expected: adminsOnly(OK) },
  {
    endpoint: 'PATCH /admin/groups/:id',
    build: async (actor, actors) => ({
      ...(await groupPath()(actor, actors)),
      method: 'patch',
      body: { name: 'E2E-Rbac-2' },
    }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'PUT /admin/groups/:id/mentor',
    build: async (actor, actors) => ({
      ...(await groupPath('/mentor')(actor, actors)),
      method: 'put',
      body: { mentorId: (await actors.newUser(Role.MENTOR)).id },
    }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'POST /admin/groups/:id/members',
    build: async (actor, actors) => ({
      ...(await groupPath('/members')(actor, actors)),
      method: 'post',
      body: { studentIds: [(await actors.newUser(Role.STUDENT)).id] },
    }),
    expected: adminsOnly(OK),
  },
  {
    endpoint: 'DELETE /admin/groups/:id/members/:studentId',
    build: async (actor, actors) => {
      const { group, studentId } = await ownGroup(actor, actors);
      return { method: 'delete', path: `/admin/groups/${group.id}/members/${studentId}` };
    },
    expected: adminsOnly(NO_CONTENT),
  },
  {
    endpoint: 'GET /mentor/groups',
    build: resolved({ method: 'get', path: '/mentor/groups' }),
    expected: mentorOnly(OK),
  },
  {
    endpoint: "GET /mentor/groups/:id (o'z guruhi)",
    build: async (actor, actors) => ({
      method: 'get',
      path: `/mentor/groups/${(await ownGroup(actor, actors)).group.id}`,
    }),
    expected: mentorOnly(OK),
  },
  {
    endpoint: "GET /mentor/groups/:id/students (o'z guruhi)",
    build: async (actor, actors) => ({
      method: 'get',
      path: `/mentor/groups/${(await ownGroup(actor, actors)).group.id}/students`,
    }),
    expected: mentorOnly(OK),
  },
  {
    endpoint: 'GET /mentor/groups/:id (begona guruh)',
    build: async (_actor, actors) => ({
      method: 'get',
      path: `/mentor/groups/${(await actors.newGroup()).id}`,
    }),
    expected: mentorOnly(NOT_FOUND),
  },
  {
    endpoint: 'GET /mentor/groups/:id/students (begona guruh)',
    build: async (_actor, actors) => ({
      method: 'get',
      path: `/mentor/groups/${(await foreignGroup(actors)).id}/students`,
    }),
    expected: mentorOnly(NOT_FOUND),
  },
  {
    endpoint: "GET /mentor/students/:id (o'z guruhi studenti)",
    build: async (actor, actors) => ({
      method: 'get',
      path: `/mentor/students/${(await ownGroup(actor, actors)).studentId}`,
    }),
    expected: mentorOnly(OK),
  },
  {
    endpoint: 'GET /mentor/students/:id (begona student)',
    build: async (_actor, actors) => ({
      method: 'get',
      path: `/mentor/students/${(await actors.newUser(Role.STUDENT)).id}`,
    }),
    expected: mentorOnly(NOT_FOUND),
  },
];
