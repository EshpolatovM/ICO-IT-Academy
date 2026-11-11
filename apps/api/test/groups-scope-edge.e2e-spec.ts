import { ErrorCode, Role } from '@lms/shared';
import type { ParentTokenCreatedResponse, ParentTokensListResponse } from '@lms/shared';

import { useE2eContext } from './support/e2e-context.js';
import { mentoredGroup, mentorSessionOf, useAdminSession } from './support/group-api.js';

import type { ApiClient } from './support/group-api.js';

const PARALLEL_ROUNDS = 3;

/**
 * 2.3 — mentor scope'ining chegaraviy holatlari (docs/12 §2, §12, docs/01 §3): mentor o'z
 * studentining ota-ona tokenini bekor qiladi/qayta yaratadi (begonasida — 404), mentor olib
 * tashlansa yoki guruh qayta faollashsa scope darhol o'zgaradi, parallel a'zo qo'shishda
 * bitta student ikki faol guruhga tushmaydi (409, 500 emas).
 */
describe('Mentor scope chegaraviy holatlari (e2e)', () => {
  const context = useE2eContext();
  const admin = useAdminSession(context);

  const student = () => context.fixtures.createUser({ role: Role.STUDENT });
  const tokensPath = (studentId: string) => `/students/${studentId}/parent-tokens`;

  async function issueBy(api: ApiClient, studentId: string): Promise<string> {
    const response = await api.post(tokensPath(studentId), { label: 'Otasi' }).expect(201);
    return (response.body as ParentTokenCreatedResponse).id;
  }

  async function activeTokenIds(studentId: string): Promise<string[]> {
    const response = await admin.api.get(tokensPath(studentId)).expect(200);
    return (response.body as ParentTokensListResponse).items.map((item) => item.id);
  }

  it("mentor: o'z studentining tokenini qayta yaratadi va bekor qiladi; begonasida — 404", async () => {
    const { user: mentor, api } = await mentorSessionOf(context.app, context.fixtures);
    const [own, stranger] = [await student(), await student()];
    await context.fixtures.createGroup({ mentorId: mentor.id, studentIds: [own.id] });
    await context.fixtures.createGroup({ studentIds: [stranger.id] });

    const first = await issueBy(api, own.id);
    const regenerated = await api.post(`${tokensPath(own.id)}/${first}/regenerate`).expect(201);
    const second = (regenerated.body as ParentTokenCreatedResponse).id;
    expect(await activeTokenIds(own.id)).toEqual([second]);
    await api.delete(`${tokensPath(own.id)}/${second}`).expect(204);
    expect(await activeTokenIds(own.id)).toEqual([]);

    const foreign = await issueBy(admin.api, stranger.id);
    const revoke = await api.delete(`${tokensPath(stranger.id)}/${foreign}`).expect(404);
    expect(revoke.body).toMatchObject({ error: { code: ErrorCode.NOT_FOUND } });
    await api.post(`${tokensPath(stranger.id)}/${foreign}/regenerate`).expect(404);
    expect(await activeTokenIds(stranger.id)).toEqual([foreign]);
  });

  it('mentor olib tashlansa ({mentorId: null}) — eski mentor darhol 404 oladi', async () => {
    const { mentor, studentId, groupId } = await mentoredGroup(context.app, context.fixtures);
    const { api } = mentor;
    await api.get(`/mentor/groups/${groupId}/students`).expect(200);
    await api.get(`/mentor/students/${studentId}`).expect(200);

    const unassigned = await admin.api.put(`/admin/groups/${groupId}/mentor`, { mentorId: null });
    expect(unassigned.status).toBe(200);
    expect(unassigned.body).toMatchObject({ mentor: null });

    await api.get(`/mentor/groups/${groupId}`).expect(404);
    await api.get(`/mentor/groups/${groupId}/students`).expect(404);
    await api.get(`/mentor/students/${studentId}`).expect(404);
    await api.post(`/students/${studentId}/reset-password`).expect(404);
    const groups = await api.get('/mentor/groups').expect(200);
    expect(groups.body).toMatchObject({ items: [] });
  });

  it('arxivdan qayta ACTIVE qilinsa — mentor yana 200 oladi', async () => {
    const { mentor, studentId, groupId } = await mentoredGroup(context.app, context.fixtures);
    const setStatus = (status: string) =>
      admin.api.patch(`/admin/groups/${groupId}`, { status }).expect(200);

    await setStatus('ARCHIVED');
    await mentor.api.get(`/mentor/groups/${groupId}`).expect(404);
    await mentor.api.get(`/mentor/students/${studentId}`).expect(404);

    await setStatus('ACTIVE');
    await mentor.api.get(`/mentor/groups/${groupId}`).expect(200);
    const students = await mentor.api.get(`/mentor/groups/${groupId}/students`).expect(200);
    expect(students.body).toMatchObject({ items: [{ id: studentId }] });
    await mentor.api.get(`/mentor/students/${studentId}`).expect(200);
  });

  it.each(Array.from({ length: PARALLEL_ROUNDS }, (_, round) => round + 1))(
    "parallel qo'shish (%i): bitta student ikki guruhga — 200 va 409, 500 yo'q",
    async () => {
      const [shared, onlyA, onlyB] = [await student(), await student(), await student()];
      const [groupA, groupB] = [
        await context.fixtures.createGroup(),
        await context.fixtures.createGroup(),
      ];

      const responses = await Promise.all([
        admin.api.post(`/admin/groups/${groupA.id}/members`, { studentIds: [shared.id, onlyA.id] }),
        admin.api.post(`/admin/groups/${groupB.id}/members`, { studentIds: [onlyB.id, shared.id] }),
      ]);

      expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
      const conflict = responses.find((response) => response.status === 409);
      expect(conflict?.body).toMatchObject({
        error: {
          code: ErrorCode.STUDENT_ALREADY_IN_GROUP,
          details: { studentIds: [shared.id] },
        },
      });
      const counts = await Promise.all(
        [groupA, groupB].map(async (group) => {
          const detail = await admin.api.get(`/admin/groups/${group.id}`).expect(200);
          return (detail.body as { membersCount: number }).membersCount;
        }),
      );
      expect(counts.sort()).toEqual([0, 2]);
    },
  );
});
