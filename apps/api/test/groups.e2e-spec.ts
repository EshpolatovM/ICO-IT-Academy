import { ErrorCode, Role } from '@lms/shared';
import type { AdminGroupDetail, ParentExchangeResponse } from '@lms/shared';

import { login } from './support/auth-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';
import { apiAs, mentorSessionOf } from './support/group-api.js';
import {
  asParent,
  exchange,
  issueParentToken,
  pairOf,
  resetParentExchangeLimits,
} from './support/parent-fixtures.js';

import type { TestUser } from './support/auth-fixtures.js';
import type { ApiClient } from './support/group-api.js';

/**
 * 2.3 — guruhlar va mentor scope'i (docs/12 §2, §12, docs/01 §3, S-02 A, S-03 A, S-10 A):
 * admin guruh boshqaruvi, 409 holatlari, mentor o'z studentiga kira oladi, begonasiga — 404,
 * a'zolik/mentor/holat o'zgarishi scope keshiga darhol ta'sir qiladi, ota-ona `groupName`.
 */
describe('Guruhlar va mentor scope (e2e)', () => {
  const context = useE2eContext();
  let adminToken: string;

  beforeAll(async () => {
    const admin = await context.fixtures.createUser({ role: Role.ADMIN });
    adminToken = (await login(context.app, admin)).accessToken;
  });

  const admin = () => apiAs(context.app, adminToken);

  async function mentorSession(): Promise<{ mentor: TestUser; api: ApiClient }> {
    const { user, api } = await mentorSessionOf(context.app, context.fixtures);
    return { mentor: user, api };
  }

  const student = () => context.fixtures.createUser({ role: Role.STUDENT });

  it("admin: yaratish, ro'yxat (filtr), tafsilot, a'zo qo'shish/chiqarish", async () => {
    const { mentor } = await mentorSession();
    const { pathId } = await context.fixtures.createGroup();
    const created = await admin()
      .post('/admin/groups', {
        name: 'E2E-Groups',
        pathId,
        mentorId: mentor.id,
        startsAt: '2026-12-01',
      })
      .expect(201);
    const group = created.body as AdminGroupDetail;
    context.fixtures.trackGroup(group.id);
    expect(group).toMatchObject({
      status: 'ACTIVE',
      startsAt: '2026-12-01',
      mentor: { id: mentor.id },
      membersCount: 0,
      members: [],
    });

    const [s1, s2] = [await student(), await student()];
    const added = await admin()
      .post(`/admin/groups/${group.id}/members`, { studentIds: [s1.id, s2.id] })
      .expect(200);
    expect((added.body as AdminGroupDetail).membersCount).toBe(2);

    const list = await admin()
      .get(`/admin/groups?mentorId=${mentor.id}&pathId=${pathId}`)
      .expect(200);
    expect(list.body).toMatchObject({ total: 1, items: [{ id: group.id, membersCount: 2 }] });

    await admin().delete(`/admin/groups/${group.id}/members/${s1.id}`).expect(204);
    await admin().delete(`/admin/groups/${group.id}/members/${s1.id}`).expect(404);
    const detail = await admin().get(`/admin/groups/${group.id}`).expect(200);
    expect((detail.body as AdminGroupDetail).members.map((member) => member.id)).toEqual([s2.id]);
  });

  it("validatsiya: noma'lum yo'l, faol bo'lmagan mentor, topilmagan student — 400", async () => {
    const group = await context.fixtures.createGroup();
    const inactive = await context.fixtures.createUser({ role: Role.MENTOR, status: 'INACTIVE' });
    const staff = await context.fixtures.createUser({ role: Role.ADMIN });

    const badPath = await admin()
      .post('/admin/groups', { name: 'X', pathId: group.id })
      .expect(400);
    expect(badPath.body).toMatchObject({ error: { details: [{ field: 'pathId' }] } });
    await admin().put(`/admin/groups/${group.id}/mentor`, { mentorId: inactive.id }).expect(400);
    await admin().put(`/admin/groups/${group.id}/mentor`, { mentorId: staff.id }).expect(400);
    const badStudent = await admin()
      .post(`/admin/groups/${group.id}/members`, { studentIds: [staff.id] })
      .expect(400);
    expect(badStudent.body).toMatchObject({ error: { details: [{ field: 'studentIds.0' }] } });
  });

  it("student ikki faol guruhda bo'la olmaydi (409); arxivlangan guruhga qo'shib bo'lmaydi (409)", async () => {
    const s1 = await student();
    const first = await context.fixtures.createGroup({ studentIds: [s1.id] });
    const second = await context.fixtures.createGroup();
    const archived = await context.fixtures.createGroup({ status: 'ARCHIVED' });

    const conflict = await admin()
      .post(`/admin/groups/${second.id}/members`, { studentIds: [s1.id] })
      .expect(409);
    expect(conflict.body).toMatchObject({
      error: { code: ErrorCode.STUDENT_ALREADY_IN_GROUP, details: { studentIds: [s1.id] } },
    });
    const blocked = await admin()
      .post(`/admin/groups/${archived.id}/members`, { studentIds: [(await student()).id] })
      .expect(409);
    expect(blocked.body).toMatchObject({ error: { code: ErrorCode.GROUP_ARCHIVED } });

    await admin().delete(`/admin/groups/${first.id}/members/${s1.id}`).expect(204);
    await admin()
      .post(`/admin/groups/${second.id}/members`, { studentIds: [s1.id] })
      .expect(200);
  });

  it("mentor: o'z studentiga profil, parol tiklash, ota-ona tokeni; begonasiga — 404", async () => {
    const { mentor, api } = await mentorSession();
    const [own, stranger] = [await student(), await student()];
    const group = await context.fixtures.createGroup({ mentorId: mentor.id, studentIds: [own.id] });
    await context.fixtures.createGroup({ studentIds: [stranger.id] });

    const groups = await api.get('/mentor/groups').expect(200);
    expect(groups.body).toMatchObject({ items: [{ id: group.id, studentsCount: 1 }] });
    const students = await api.get(`/mentor/groups/${group.id}/students`).expect(200);
    expect(students.body).toMatchObject({ items: [{ id: own.id, studentCode: own.studentCode }] });
    const profile = await api.get(`/mentor/students/${own.id}`).expect(200);
    expect(profile.body).toMatchObject({
      group: { id: group.id },
      parentTokensCount: 0,
      status: 'ACTIVE',
    });
    await api.post(`/students/${own.id}/reset-password`).expect(200);
    await api.post(`/students/${own.id}/parent-tokens`, { label: 'Onasi' }).expect(201);
    await api.get(`/students/${own.id}/parent-tokens`).expect(200);

    await api.get(`/mentor/students/${stranger.id}`).expect(404);
    await api.post(`/students/${stranger.id}/reset-password`).expect(404);
    await api.get(`/students/${stranger.id}/parent-tokens`).expect(404);
    await api.post(`/students/${stranger.id}/parent-tokens`, {}).expect(404);
  });

  it("guruhdan chiqarilgan studentni mentor darhol ko'rmaydi (kesh invalidatsiyasi)", async () => {
    const { mentor, api } = await mentorSession();
    const s1 = await student();
    const group = await context.fixtures.createGroup({ mentorId: mentor.id, studentIds: [s1.id] });
    await api.get(`/mentor/students/${s1.id}`).expect(200);

    await admin().delete(`/admin/groups/${group.id}/members/${s1.id}`).expect(204);
    await api.get(`/mentor/students/${s1.id}`).expect(404);
    await api.post(`/students/${s1.id}/reset-password`).expect(404);

    await admin()
      .post(`/admin/groups/${group.id}/members`, { studentIds: [s1.id] })
      .expect(200);
    await api.get(`/mentor/students/${s1.id}`).expect(200);
  });

  it("mentor almashtirilsa yoki guruh arxivlansa — scope darhol o'zgaradi", async () => {
    const first = await mentorSession();
    const second = await mentorSession();
    const s1 = await student();
    const group = await context.fixtures.createGroup({
      mentorId: first.mentor.id,
      studentIds: [s1.id],
    });
    await first.api.get(`/mentor/students/${s1.id}`).expect(200);
    await second.api.get(`/mentor/students/${s1.id}`).expect(404);

    await admin()
      .put(`/admin/groups/${group.id}/mentor`, { mentorId: second.mentor.id })
      .expect(200);
    await first.api.get(`/mentor/students/${s1.id}`).expect(404);
    await first.api.get(`/mentor/groups/${group.id}`).expect(404);
    await second.api.get(`/mentor/students/${s1.id}`).expect(200);
    await second.api.get(`/mentor/groups/${group.id}/students`).expect(200);

    await admin().patch(`/admin/groups/${group.id}`, { status: 'ARCHIVED' }).expect(200);
    await second.api.get(`/mentor/students/${s1.id}`).expect(404);
    await second.api.get(`/mentor/groups/${group.id}`).expect(404);
    await second.api.get(`/mentor/groups/${group.id}/students`).expect(404);
    await first.api.get(`/mentor/groups/${group.id}/students`).expect(404);
  });

  it('ota-ona: exchange va /auth/me da farzandning guruh nomi', async () => {
    const s1 = await student();
    const group = await context.fixtures.createGroup({ studentIds: [s1.id] });
    const issued = await issueParentToken(context.app, adminToken, s1.id);
    await resetParentExchangeLimits(context.app);

    const session = await exchange(context.app, { tokens: [issued.token] }).expect(200);
    expect((session.body as ParentExchangeResponse).children).toEqual([
      expect.objectContaining({ studentId: s1.id, groupName: group.name }),
    ]);
    const me = await asParent(context.app, pairOf(session, 'ps')).get('/auth/me').expect(200);
    expect(me.body).toMatchObject({ children: [{ studentId: s1.id, groupName: group.name }] });
  });
});
