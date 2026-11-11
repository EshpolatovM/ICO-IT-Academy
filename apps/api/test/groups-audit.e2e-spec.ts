import { randomBytes } from 'node:crypto';

import { AuditAction, Role } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { useE2eContext } from './support/e2e-context.js';
import { groupAuditRows, mentorSessionOf, useAdminSession } from './support/group-api.js';

const NAME_SUFFIX_BYTES = 4;

/**
 * 2.3 — guruh amallari auditi (docs/01 §4, docs/11 §1 `audit_logs`, `entity_type = GROUP`):
 * har bir amal bitta yozuv, aktyor — admin, faqat o'zgargan maydonlar; no-op — yozuv yo'q.
 */
describe('Guruhlar auditi (e2e)', () => {
  const context = useE2eContext();
  const admin = useAdminSession(context);

  const uniqueName = () => `E2E-Aud-${randomBytes(NAME_SUFFIX_BYTES).toString('hex')}`;

  async function createViaApi(body: object): Promise<AdminGroupDetail> {
    const response = await admin.api.post('/admin/groups', body).expect(201);
    const group = response.body as AdminGroupDetail;
    context.fixtures.trackGroup(group.id);
    return group;
  }

  it("GROUP_CREATED: yangi holat (nom, holat, sana, yo'l, mentor), aktyor — admin", async () => {
    const { user: mentor } = await mentorSessionOf(context.app, context.fixtures);
    const { pathId } = await context.fixtures.createGroup();
    const name = uniqueName();
    const group = await createViaApi({ name, pathId, mentorId: mentor.id, startsAt: '2026-12-01' });

    expect(await groupAuditRows(context.app, group.id)).toEqual([
      {
        action: AuditAction.GROUP_CREATED,
        actorId: admin.user.id,
        before: null,
        after: {
          name,
          status: 'ACTIVE',
          startsAt: '2026-12-01',
          pathId,
          mentorId: mentor.id,
        },
      },
    ]);
  });

  it("GROUP_UPDATED: faqat o'zgargan maydonlar; no-op PATCH — yozuv yo'q", async () => {
    const group = await context.fixtures.createGroup();
    const path = `/admin/groups/${group.id}`;
    const renamed = uniqueName();

    await admin.api.patch(path, { name: group.name, status: 'ACTIVE', startsAt: null }).expect(200);
    expect(await groupAuditRows(context.app, group.id)).toEqual([]);

    await admin.api.patch(path, { name: renamed, startsAt: '2027-01-10' }).expect(200);
    await admin.api.patch(path, { name: renamed, startsAt: '2027-01-10' }).expect(200);
    await admin.api.patch(path, { status: 'ARCHIVED' }).expect(200);

    expect(await groupAuditRows(context.app, group.id)).toEqual([
      {
        action: AuditAction.GROUP_UPDATED,
        actorId: admin.user.id,
        before: { name: group.name, startsAt: null },
        after: { name: renamed, startsAt: '2027-01-10' },
      },
      {
        action: AuditAction.GROUP_UPDATED,
        actorId: admin.user.id,
        before: { status: 'ACTIVE' },
        after: { status: 'ARCHIVED' },
      },
    ]);
  });

  it("GROUP_MENTOR_ASSIGNED: tayinlash va olib tashlash; o'sha mentor — yozuv yo'q", async () => {
    const { user: mentor } = await mentorSessionOf(context.app, context.fixtures);
    const group = await context.fixtures.createGroup();
    const path = `/admin/groups/${group.id}/mentor`;

    await admin.api.put(path, { mentorId: mentor.id }).expect(200);
    await admin.api.put(path, { mentorId: mentor.id }).expect(200);
    await admin.api.put(path, { mentorId: null }).expect(200);

    expect(await groupAuditRows(context.app, group.id)).toEqual([
      {
        action: AuditAction.GROUP_MENTOR_ASSIGNED,
        actorId: admin.user.id,
        before: { mentorId: null },
        after: { mentorId: mentor.id },
      },
      {
        action: AuditAction.GROUP_MENTOR_ASSIGNED,
        actorId: admin.user.id,
        before: { mentorId: mentor.id },
        after: { mentorId: null },
      },
    ]);
  });

  it("GROUP_MEMBERS_ADDED va GROUP_MEMBER_REMOVED; xato so'rov (409/404) — yozuv yo'q", async () => {
    const [s1, s2] = [
      await context.fixtures.createUser({ role: Role.STUDENT }),
      await context.fixtures.createUser({ role: Role.STUDENT }),
    ];
    const group = await context.fixtures.createGroup();
    const members = `/admin/groups/${group.id}/members`;

    await admin.api.post(members, { studentIds: [s1.id, s2.id] }).expect(200);
    await admin.api.post(members, { studentIds: [s1.id] }).expect(409);
    await admin.api.delete(`${members}/${s2.id}`).expect(204);
    await admin.api.delete(`${members}/${s2.id}`).expect(404);

    expect(await groupAuditRows(context.app, group.id)).toEqual([
      {
        action: AuditAction.GROUP_MEMBERS_ADDED,
        actorId: admin.user.id,
        before: null,
        after: { studentIds: [s1.id, s2.id] },
      },
      {
        action: AuditAction.GROUP_MEMBER_REMOVED,
        actorId: admin.user.id,
        before: { studentId: s2.id },
        after: null,
      },
    ]);
  });
});
