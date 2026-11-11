import { randomBytes } from 'node:crypto';

import { AuditAction, ErrorCode, Role, UserStatus } from '@lms/shared';
import type {
  CreatedStaffResponse,
  CreatedStudentResponse,
  LoginResponse,
  MentorDetail,
  PaginatedResult,
  StudentDetail,
} from '@lms/shared';

import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import {
  accessTokenFor,
  API,
  cookiePair,
  http,
  loginRequest,
  refreshRequest,
  refreshSetCookie,
} from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  asParent,
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
} from './support/parent-fixtures.js';
import { randomTestPhone } from './support/test-users.js';

import type { TestUser } from './support/auth-fixtures.js';

/** Admin bergan boshlang'ich parol (siyosatga mos). */
const PASSWORD = 'Boshqa1parol';

/** Foydalanuvchilarni boshqarish (docs/12 §2): yaratish, qidiruv/filtr/pagination, deaktivatsiya. */
describe('Foydalanuvchilarni boshqarish (e2e)', () => {
  const context = useE2eContext();
  let adminToken: string;
  /** Shu suite yozuvlarini dev bazadagi boshqa yozuvlardan ajratish uchun noyob ism. */
  const marker = `E2e${randomBytes(4).toString('hex')}`;

  beforeAll(async () => {
    adminToken = await accessTokenFor(context.app, context.fixtures, Role.ADMIN);
  });

  const asAdmin = {
    get: (path: string) =>
      http(context.app).get(`${API}${path}`).auth(adminToken, { type: 'bearer' }),
    post: (path: string, body: object) =>
      http(context.app).post(`${API}${path}`).auth(adminToken, { type: 'bearer' }).send(body),
    patch: (path: string, body: object) =>
      http(context.app).patch(`${API}${path}`).auth(adminToken, { type: 'bearer' }).send(body),
  };

  async function createStudent(body: object): Promise<CreatedStudentResponse> {
    const response = await asAdmin.post('/admin/students', body).expect(201);
    expect(response.headers['cache-control']).toBe('no-store');
    const created = response.body as CreatedStudentResponse;
    context.fixtures.track(created.id);
    return created;
  }

  const asTestUser = (created: CreatedStudentResponse): TestUser => ({
    id: created.id,
    role: Role.STUDENT,
    phone: null,
    studentCode: created.studentCode,
  });

  it('student guruh bilan: javob, vaqtinchalik parol bilan kirish, tafsilotda guruh, audit', async () => {
    const group = await context.fixtures.createGroup();
    const created = await createStudent({
      firstName: marker,
      lastName: 'Guruhli',
      groupId: group.id,
    });

    expect(created).toEqual({
      id: expect.any(String) as string,
      studentCode: expect.stringMatching(/^ST-\d+$/) as string,
      temporaryPassword: expect.any(String) as string,
      mustChangePassword: true,
    });
    const relogin = await loginRequest(
      context.app,
      asTestUser(created),
      created.temporaryPassword ?? '',
    );
    expect(relogin.status).toBe(200);
    expect(relogin.body).toMatchObject({ user: { mustChangePassword: true } });

    const detail = await asAdmin.get(`/admin/students/${created.id}`).expect(200);
    expect(detail.body).toMatchObject({
      group: { id: group.id, name: group.name },
      status: 'ACTIVE',
    });
    const audit = await context.app.get(PrismaService).db.auditLog.findFirst({
      where: { entityId: created.id, action: AuditAction.USER_CREATED },
    });
    expect(audit?.after).toMatchObject({ groupId: group.id, passwordGenerated: true });
    expect(JSON.stringify(audit?.after)).not.toContain(created.temporaryPassword);
  });

  it("guruh arxivlangan yoki yo'q — 400, noma'lum maydon — 400", async () => {
    const archived = await context.fixtures.createGroup({ status: 'ARCHIVED' });

    const response = await asAdmin
      .post('/admin/students', { firstName: marker, lastName: 'X', groupId: archived.id })
      .expect(400);
    expect(response.body).toMatchObject({
      error: { code: ErrorCode.VALIDATION_ERROR, details: [{ field: 'groupId' }] },
    });
    await asAdmin
      .post('/admin/students', { firstName: 'A', lastName: 'B', role: 'ADMIN' })
      .expect(400);
    await asAdmin.patch(`/admin/students/${archived.id}`, {}).expect(400);
  });

  it('qidiruv (ism, kod), filtr (guruh, holat), pagination va saralash', async () => {
    const group = await context.fixtures.createGroup();
    const name = `${marker}Q`;
    const first = await createStudent({ firstName: name, lastName: 'Aqidiruv', groupId: group.id });
    const second = await createStudent({ firstName: name, lastName: 'Bqidiruv' });
    await asAdmin
      .patch(`/admin/students/${second.id}`, { status: UserStatus.INACTIVE })
      .expect(200);

    const list = async (query: string) =>
      (await asAdmin.get(`/admin/students?${query}`).expect(200))
        .body as PaginatedResult<StudentDetail>;
    const ids = async (query: string) => (await list(query)).items.map((item) => item.id);

    expect(await ids(`q=${encodeURIComponent(`${name.toLowerCase()} aqid`)}`)).toEqual([first.id]);
    expect(await ids(`q=${first.studentCode.toLowerCase()}`)).toEqual([first.id]);
    expect(await ids(`q=${first.studentCode.slice(3)}`)).toEqual([first.id]);
    expect(await ids(`groupId=${group.id}`)).toEqual([first.id]);
    expect(await ids(`q=${name}&status=INACTIVE`)).toEqual([second.id]);
    expect(await ids(`q=${name}&sort=-lastName`)).toEqual([second.id, first.id]);

    const page = await list(`q=${name}&pageSize=1&page=2&sort=lastName`);
    expect(page).toMatchObject({ total: 2, page: 2, pageSize: 1 });
    expect(page.items.map((item) => item.id)).toEqual([second.id]);
    await asAdmin.get('/admin/students?sort=email').expect(400);
    await asAdmin.get('/admin/students?pageSize=101').expect(400);
  });

  it('student deaktivatsiyasi: access/refresh/login 401, ota-ona sessiyasi 401; aktivatsiyadan keyin tiklanadi', async () => {
    const { app } = context;
    const created = await createStudent({
      firstName: marker,
      lastName: 'Deakt',
      password: PASSWORD,
    });
    const student = asTestUser(created);
    const loggedIn = await loginRequest(app, student, PASSWORD).expect(200);
    const session = {
      accessToken: (loggedIn.body as LoginResponse).accessToken,
      cookie: cookiePair(refreshSetCookie(loggedIn)),
    };
    const issued = await issueParentToken(app, adminToken, created.id);
    await resetParentExchangeLimits(app);
    const ps = pairOf(await exchange(app, { tokens: [issued.token] }).expect(200), 'ps');
    await asParent(app, ps).get('/auth/me').expect(200);

    const patched = await asAdmin
      .patch(`/admin/students/${created.id}`, { status: UserStatus.INACTIVE })
      .expect(200);
    expect(patched.body).toMatchObject({ status: UserStatus.INACTIVE });

    await http(app).get(`${API}/auth/me`).auth(session.accessToken, { type: 'bearer' }).expect(401);
    await refreshRequest(app, session.cookie).expect(401);
    await loginRequest(app, student, PASSWORD).expect(401);
    await asParent(app, ps).get('/auth/me').expect(401);

    await asAdmin.patch(`/admin/students/${created.id}`, { status: UserStatus.ACTIVE }).expect(200);
    await loginRequest(app, student, PASSWORD).expect(200);
    await asParent(app, ps).get('/auth/me').expect(200);
    const actions = await app.get(PrismaService).db.auditLog.findMany({
      where: { entityId: created.id },
      orderBy: { id: 'asc' },
      select: { action: true },
    });
    expect(actions.map((entry) => entry.action)).toEqual(
      expect.arrayContaining([AuditAction.USER_DEACTIVATED, AuditAction.USER_ACTIVATED]),
    );
  });

  it('mentor: yaratish, telefon band — 409, PATCH (telefon/ism), tafsilotda guruhlar', async () => {
    const phone = randomTestPhone();
    const response = await asAdmin
      .post('/admin/mentors', { phone, firstName: marker, lastName: 'Mentor' })
      .expect(201);
    const created = response.body as CreatedStaffResponse;
    context.fixtures.track(created.id);
    expect(created).toMatchObject({ phone, mustChangePassword: true });
    const mentorUser: TestUser = { id: created.id, role: Role.MENTOR, phone, studentCode: null };
    await loginRequest(context.app, mentorUser, created.temporaryPassword ?? '').expect(200);

    const duplicate = await asAdmin
      .post('/admin/mentors', { phone, firstName: 'A', lastName: 'B' })
      .expect(409);
    expect(duplicate.body).toMatchObject({
      error: { code: ErrorCode.CONFLICT, details: { field: 'phone' } },
    });

    const newPhone = randomTestPhone();
    const updated = await asAdmin
      .patch(`/admin/mentors/${created.id}`, { phone: newPhone, lastName: 'Yangi' })
      .expect(200);
    expect(updated.body).toMatchObject({ phone: newPhone, lastName: 'Yangi', groups: [] });
    const list = await asAdmin.get(`/admin/mentors?q=${marker}`).expect(200);
    expect((list.body as PaginatedResult<MentorDetail>).items.map((item) => item.id)).toEqual([
      created.id,
    ]);
  });
});
