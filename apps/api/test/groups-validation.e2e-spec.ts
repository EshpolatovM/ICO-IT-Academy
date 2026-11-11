import { randomUUID } from 'node:crypto';

import { ErrorCode, GROUP_MEMBERS_ADD_MAX, PAGINATION_DEFAULTS, Role } from '@lms/shared';

import { useE2eContext } from './support/e2e-context.js';
import { sessionOf, useAdminSession } from './support/group-api.js';

import type request from 'supertest';

const NOT_A_UUID = 'not-a-uuid';

function expectValidation(response: request.Response, field?: string): void {
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({ error: { code: ErrorCode.VALIDATION_ERROR } });
  if (field !== undefined) {
    expect(response.body).toMatchObject({
      error: { details: expect.arrayContaining([expect.objectContaining({ field })]) as unknown },
    });
  }
}

/**
 * 2.3 — guruhlar API'ning chegaraviy holatlari (docs/12 §0, §2): mavjud bo'lmagan guruh — 404,
 * noto'g'ri UUID — 400, DTO validatsiyasi (`@lms/shared` sxemalari) — 400 `VALIDATION_ERROR`.
 */
describe('Guruhlar API — 404 va validatsiya (e2e)', () => {
  const context = useE2eContext();
  const admin = useAdminSession(context);

  const student = () => context.fixtures.createUser({ role: Role.STUDENT });

  it("mavjud bo'lmagan guruh: GET, PATCH, PUT mentor, POST members, DELETE member — 404", async () => {
    const missing = `/admin/groups/${randomUUID()}`;
    const s1 = await student();
    const responses = [
      await admin.api.get(missing),
      await admin.api.patch(missing, { name: 'E2E-Yoq' }),
      await admin.api.put(`${missing}/mentor`, { mentorId: null }),
      await admin.api.post(`${missing}/members`, { studentIds: [s1.id] }),
      await admin.api.delete(`${missing}/members/${s1.id}`),
    ];

    responses.forEach((response) => {
      expect({ status: response.status, body: response.body as unknown }).toMatchObject({
        status: 404,
        body: { error: { code: ErrorCode.NOT_FOUND } },
      });
    });
  });

  it("noto'g'ri UUID (guruh, student, mentor yo'llari) — 400", async () => {
    const group = await context.fixtures.createGroup();

    expectValidation(await admin.api.get(`/admin/groups/${NOT_A_UUID}`));
    expectValidation(await admin.api.patch(`/admin/groups/${NOT_A_UUID}`, { name: 'X' }));
    expectValidation(await admin.api.delete(`/admin/groups/${group.id}/members/${NOT_A_UUID}`));
    expectValidation(await admin.api.get(`/admin/groups?mentorId=${NOT_A_UUID}`));
    const { api: mentor } = await sessionOf(context.app, context.fixtures, Role.MENTOR);
    expectValidation(await mentor.get(`/mentor/groups/${NOT_A_UUID}`));
    expectValidation(await mentor.get(`/mentor/groups/${NOT_A_UUID}/students`));
  });

  it("mentor: `@StudentScope` yo'llarida noto'g'ri UUID ham 400 (docs/12 §0), 404 emas", async () => {
    const { api: mentor } = await sessionOf(context.app, context.fixtures, Role.MENTOR);

    expectValidation(await mentor.get(`/mentor/students/${NOT_A_UUID}`));
    expectValidation(await mentor.get(`/students/${NOT_A_UUID}/parent-tokens`));
  });

  it("a'zolar: bo'sh ro'yxat, 101 ta, takroriy id, noto'g'ri element — 400, hech kim qo'shilmaydi", async () => {
    const group = await context.fixtures.createGroup();
    const s1 = await student();
    const members = `/admin/groups/${group.id}/members`;
    const tooMany = Array.from({ length: GROUP_MEMBERS_ADD_MAX + 1 }, () => randomUUID());

    expectValidation(await admin.api.post(members, { studentIds: [] }), 'studentIds');
    expectValidation(await admin.api.post(members, { studentIds: tooMany }), 'studentIds');
    expectValidation(await admin.api.post(members, { studentIds: [s1.id, s1.id] }), 'studentIds');
    expectValidation(await admin.api.post(members, { studentIds: [NOT_A_UUID] }), 'studentIds.0');
    expectValidation(await admin.api.post(members, {}), 'studentIds');
    expectValidation(await admin.api.post(members, { studentIds: [s1.id], extra: true }));

    const detail = await admin.api.get(`/admin/groups/${group.id}`).expect(200);
    expect(detail.body).toMatchObject({ membersCount: 0, members: [] });
  });

  it("PATCH: bo'sh body, noma'lum maydon, noto'g'ri sana/holat/nom — 400", async () => {
    const group = await context.fixtures.createGroup();
    const path = `/admin/groups/${group.id}`;

    expectValidation(await admin.api.patch(path, {}));
    expectValidation(await admin.api.patch(path, { mentorId: null }));
    expectValidation(await admin.api.patch(path, { startsAt: '2026-13-01' }), 'startsAt');
    expectValidation(await admin.api.patch(path, { startsAt: '01.12.2026' }), 'startsAt');
    expectValidation(await admin.api.patch(path, { status: 'DELETED' }), 'status');
    expectValidation(await admin.api.patch(path, { name: '   ' }), 'name');

    const detail = await admin.api.get(path).expect(200);
    expect(detail.body).toMatchObject({ name: group.name, status: 'ACTIVE' });
  });

  it("POST /admin/groups: noto'g'ri sana, noma'lum maydon, nofaol mentor — 400; guruh yaratilmaydi", async () => {
    const { pathId } = await context.fixtures.createGroup();
    const inactive = await context.fixtures.createUser({ role: Role.MENTOR, status: 'INACTIVE' });
    const name = `E2E-Val-${randomUUID().slice(0, 8)}`;
    const base = { name, pathId };

    expectValidation(
      await admin.api.post('/admin/groups', { ...base, startsAt: '2026-02-30' }),
      'startsAt',
    );
    expectValidation(await admin.api.post('/admin/groups', { ...base, status: 'ACTIVE' }));
    expectValidation(await admin.api.post('/admin/groups', { pathId }), 'name');
    expectValidation(
      await admin.api.post('/admin/groups', { ...base, mentorId: inactive.id }),
      'mentorId',
    );

    const list = await admin.api.get(`/admin/groups?q=${name}`).expect(200);
    expect(list.body).toMatchObject({ total: 0, items: [] });
  });

  it("PUT mentor: body'siz yoki noto'g'ri UUID — 400", async () => {
    const group = await context.fixtures.createGroup();
    const path = `/admin/groups/${group.id}/mentor`;

    expectValidation(await admin.api.put(path, {}), 'mentorId');
    expectValidation(await admin.api.put(path, { mentorId: NOT_A_UUID }), 'mentorId');
  });

  it("ro'yxat so'rovi: pageSize > max, page=0, noma'lum parametr, noto'g'ri holat — 400", async () => {
    const max = PAGINATION_DEFAULTS.maxPageSize;
    expectValidation(await admin.api.get(`/admin/groups?pageSize=${String(max + 1)}`), 'pageSize');
    expectValidation(await admin.api.get('/admin/groups?page=0'), 'page');
    expectValidation(await admin.api.get('/admin/groups?foo=bar'));
    expectValidation(await admin.api.get('/admin/groups?status=DELETED'), 'status');
    await admin.api.get(`/admin/groups?pageSize=${String(max)}`).expect(200);
  });
});
