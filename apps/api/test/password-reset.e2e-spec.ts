import { AuditAction, Role } from '@lms/shared';
import type { PasswordResetResponse } from '@lms/shared';

import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import {
  API,
  http,
  login,
  loginRequest,
  refreshRequest,
  TEST_PASSWORD,
} from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';

import type { TestUser } from './support/auth-fixtures.js';

describe('Parolni tiklash va parol siyosati (e2e)', () => {
  const context = useE2eContext();

  const reset = (accessToken: string, kind: 'students' | 'staff', id: string) =>
    http(context.app)
      .post(`${API}/${kind}/${id}/reset-password`)
      .auth(accessToken, { type: 'bearer' });

  it('student: eski sessiyalar 401, vaqtinchalik parol bilan kirish mustChangePassword=true, audit', async () => {
    const { app, fixtures } = context;
    const admin = await fixtures.createUser({ role: Role.ADMIN });
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const adminToken = (await login(app, admin)).accessToken;
    const old = await login(app, student);

    const response = await reset(adminToken, 'students', student.id).expect(200);
    expect(response.headers['cache-control']).toBe('no-store');
    const { temporaryPassword } = response.body as PasswordResetResponse;
    expect(temporaryPassword).toHaveLength(10);

    await http(app).get(`${API}/auth/me`).auth(old.accessToken, { type: 'bearer' }).expect(401);
    await refreshRequest(app, old.cookie).expect(401);
    await loginRequest(app, student).expect(401);
    const relogin = await loginRequest(app, student, temporaryPassword).expect(200);
    expect(relogin.body).toMatchObject({ user: { mustChangePassword: true } });

    const audit = await app.get(PrismaService).db.auditLog.findMany({
      where: { entityId: student.id, action: AuditAction.PASSWORD_RESET },
      select: { actorId: true, actorRole: true, before: true, after: true },
    });
    expect(audit).toEqual([
      {
        actorId: admin.id,
        actorRole: Role.ADMIN,
        before: { role: Role.STUDENT, mustChangePassword: false },
        after: { role: Role.STUDENT, mustChangePassword: true },
      },
    ]);
    expect(JSON.stringify(audit)).not.toContain(temporaryPassword);
  });

  it("staff ruxsat matritsasi: A→ADMIN 403, A→MENTOR 200, SA→ADMIN 200, o'zini — 403", async () => {
    const { app, fixtures } = context;
    const superAdmin = await fixtures.createUser({ role: Role.SUPER_ADMIN });
    const admin = await fixtures.createUser({ role: Role.ADMIN });
    const otherAdmin = await fixtures.createUser({ role: Role.ADMIN });
    const mentor = await fixtures.createUser({ role: Role.MENTOR });
    const saToken = (await login(app, superAdmin)).accessToken;
    const adminToken = (await login(app, admin)).accessToken;

    await reset(adminToken, 'staff', otherAdmin.id).expect(403);
    await reset(adminToken, 'staff', superAdmin.id).expect(403);
    await reset(adminToken, 'staff', mentor.id).expect(200);
    await reset(saToken, 'staff', otherAdmin.id).expect(200);
    await reset(saToken, 'staff', superAdmin.id).expect(403);
    await reset(adminToken, 'staff', admin.id).expect(403);
  });

  it('mentor va student reset endpointlariga 403; topilmagan student — 404', async () => {
    const { app, fixtures } = context;
    const mentor: TestUser = await fixtures.createUser({ role: Role.MENTOR });
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const admin = await fixtures.createUser({ role: Role.ADMIN });
    const mentorToken = (await login(app, mentor)).accessToken;
    const studentToken = (await login(app, student)).accessToken;
    const adminToken = (await login(app, admin)).accessToken;

    await reset(mentorToken, 'students', student.id).expect(403);
    await reset(mentorToken, 'staff', admin.id).expect(403);
    await reset(studentToken, 'students', student.id).expect(403);
    await reset(adminToken, 'students', mentor.id).expect(404);
    const badId = await reset(adminToken, 'students', 'not-a-uuid').expect(400);
    expect(badId.body).toMatchObject({
      error: {
        code: 'VALIDATION_ERROR',
        details: [{ field: 'id', message: expect.any(String) as string }],
      },
    });
  });

  it("qora ro'yxatdagi parol bilan change-password — 400", async () => {
    const { app, fixtures } = context;
    const student = await fixtures.createUser({ role: Role.STUDENT });
    const { accessToken } = await login(app, student);

    const response = await http(app)
      .post(`${API}/auth/change-password`)
      .auth(accessToken, { type: 'bearer' })
      .send({ oldPassword: TEST_PASSWORD, newPassword: 'Password1' })
      .expect(400);
    expect(response.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR', details: [{ field: 'newPassword' }] },
    });
  });
});
