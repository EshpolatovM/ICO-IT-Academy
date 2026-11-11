import { AuditEntityType, Role } from '@lms/shared';

import { PrismaService } from '../../src/infra/prisma/prisma.service.js';

import { API, http, login } from './auth-fixtures.js';

import type { AuthFixtures, TestUser } from './auth-fixtures.js';
import type { E2eContext } from './e2e-context.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

/** Bearer token bilan JSON so'rovlar (guruhlar e2e testlari uchun qisqa klient). */
export function apiAs(app: INestApplication<App>, token: string) {
  const bearer = { type: 'bearer' } as const;
  return {
    get: (path: string) => http(app).get(`${API}${path}`).auth(token, bearer),
    post: (path: string, body: object = {}) =>
      http(app).post(`${API}${path}`).auth(token, bearer).send(body),
    patch: (path: string, body: object) =>
      http(app).patch(`${API}${path}`).auth(token, bearer).send(body),
    put: (path: string, body: object) =>
      http(app).put(`${API}${path}`).auth(token, bearer).send(body),
    delete: (path: string) => http(app).delete(`${API}${path}`).auth(token, bearer),
  };
}

export type ApiClient = ReturnType<typeof apiAs>;

export interface RoleSession {
  user: TestUser;
  api: ApiClient;
}

/** Berilgan roldagi yangi test foydalanuvchisi va uning nomidan klient. */
export async function sessionOf(
  app: INestApplication<App>,
  fixtures: AuthFixtures,
  role: typeof Role.ADMIN | typeof Role.MENTOR,
): Promise<RoleSession> {
  const user = await fixtures.createUser({ role });
  return { user, api: apiAs(app, (await login(app, user)).accessToken) };
}

export const mentorSessionOf = (app: INestApplication<App>, fixtures: AuthFixtures) =>
  sessionOf(app, fixtures, Role.MENTOR);

/** `describe` ichida: admin sessiyasi `beforeAll` da yaratiladi (qiymat testlar ichida o'qiladi). */
export function useAdminSession(context: E2eContext): RoleSession {
  const session = {} as RoleSession;
  beforeAll(async () => {
    Object.assign(session, await sessionOf(context.app, context.fixtures, Role.ADMIN));
  });
  return session;
}

/** Mentor (sessiyasi bilan), uning ACTIVE guruhi va undagi bitta faol student. */
export interface MentoredGroup {
  mentor: RoleSession;
  studentId: string;
  groupId: string;
}

export async function mentoredGroup(
  app: INestApplication<App>,
  fixtures: AuthFixtures,
): Promise<MentoredGroup> {
  const mentor = await mentorSessionOf(app, fixtures);
  const student = await fixtures.createUser({ role: Role.STUDENT });
  const group = await fixtures.createGroup({ mentorId: mentor.user.id, studentIds: [student.id] });
  return { mentor, studentId: student.id, groupId: group.id };
}

export interface GroupAuditRow {
  action: string;
  actorId: string | null;
  before: unknown;
  after: unknown;
}

/** Guruh bo'yicha audit yozuvlari (eskidan yangiga). */
export function groupAuditRows(
  app: INestApplication<App>,
  groupId: string,
): Promise<GroupAuditRow[]> {
  return app.get(PrismaService).db.auditLog.findMany({
    where: { entityType: AuditEntityType.GROUP, entityId: groupId },
    orderBy: { id: 'asc' },
    select: { action: true, actorId: true, before: true, after: true },
  });
}
