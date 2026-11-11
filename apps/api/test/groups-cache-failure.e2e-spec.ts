import { AuditAction, Role } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { RedisService } from '../src/infra/redis/redis.service.js';

import { useE2eContext } from './support/e2e-context.js';
import { groupAuditRows, useAdminSession } from './support/group-api.js';

/**
 * B1 — mentor scope keshi invalidatsiyasi commit'dan keyin; Redis xato bersa ham admin amali
 * muvaffaqiyatli javob qaytaradi (baza yozilgan, audit bor), 500 emas (docs/01 §3.2 p.5).
 * Faqat invalidatsiya buyrug'i sindiriladi — qolgan Redis amallari (login limitlari) ishlaydi.
 */
describe('Guruhlar: scope keshi invalidatsiyasi xatosi (e2e)', () => {
  const context = useE2eContext();
  const admin = useAdminSession(context);
  let failure: jest.SpyInstance | undefined;

  beforeEach(() => {
    failure = jest
      .spyOn(context.app.get(RedisService), 'bumpVersionsAndDelete')
      .mockRejectedValue(new Error('redis: connection lost'));
  });

  afterEach(() => {
    failure?.mockRestore();
  });

  it("PUT mentor, POST/DELETE a'zo, PATCH holat — 200/204, o'zgarishlar va audit saqlanadi", async () => {
    const mentor = await context.fixtures.createUser({ role: Role.MENTOR });
    const s1 = await context.fixtures.createUser({ role: Role.STUDENT });
    const group = await context.fixtures.createGroup();
    const path = `/admin/groups/${group.id}`;

    await admin.api.put(`${path}/mentor`, { mentorId: mentor.id }).expect(200);
    await admin.api.post(`${path}/members`, { studentIds: [s1.id] }).expect(200);
    await admin.api.delete(`${path}/members/${s1.id}`).expect(204);
    const archived = await admin.api.patch(path, { status: 'ARCHIVED' }).expect(200);

    expect(failure).toHaveBeenCalled();
    expect(archived.body as AdminGroupDetail).toMatchObject({
      status: 'ARCHIVED',
      mentor: { id: mentor.id },
      membersCount: 0,
    });
    const actions = (await groupAuditRows(context.app, group.id)).map((row) => row.action);
    expect(actions).toEqual([
      AuditAction.GROUP_MENTOR_ASSIGNED,
      AuditAction.GROUP_MEMBERS_ADDED,
      AuditAction.GROUP_MEMBER_REMOVED,
      AuditAction.GROUP_UPDATED,
    ]);
  });
});
