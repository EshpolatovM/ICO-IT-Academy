import { randomUUID } from 'node:crypto';

import { ContentStatus, ErrorCode, Role } from '@lms/shared';
import type { AdminSectionNode, SkillItem, TopicSkillsResponse } from '@lms/shared';

import { treeOf, sectionIn, useContentSuite } from './support/content-api.js';
import { TEST_REWARD, uniqueSuffix } from './support/content-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';

import type request from 'supertest';

function expectFieldError(response: request.Response, field: string): void {
  expect({ status: response.status, body: response.body as unknown }).toMatchObject({
    status: 400,
    body: {
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        details: expect.arrayContaining([expect.objectContaining({ field })]) as unknown,
      },
    },
  });
}

/**
 * 3.2 — bo'lim/mavzu/dars, tartiblash (TL Q-3), o'chirish (`HAS_PROGRESS`, `HAS_CHEST`), sandiq
 * (`afterTopicId`, `CHEST_EXISTS`), validatsiya va ko'nikmalar.
 */
describe("Kontent API — tugunlar, tartiblash, sandiq, ko'nikmalar (e2e)", () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  async function topicOrder(pathId: string, sectionId: string) {
    const section = sectionIn(await treeOf(suite.admin, pathId), sectionId);
    return section?.topics.map((topic) => [topic.id, topic.order]);
  }

  it("yaratish: oxiriga qo'shiladi (order = max + 1), DRAFT, javob — bola ro'yxatlari bilan", async () => {
    const tree = await suite.content.createTree();

    const response = await suite.admin.api
      .post(`/admin/sections/${tree.sectionId}/topics`, { title: 'Yangi mavzu' })
      .expect(201);

    expect(response.body).toMatchObject({
      order: 4,
      status: ContentStatus.DRAFT,
      skills: [],
      lessons: [],
    });
    const section = await suite.admin.api
      .patch(`/admin/sections/${tree.sectionId}`, { title: "Bo'lim" })
      .expect(200);
    expect((section.body as AdminSectionNode).topics).toHaveLength(4);
  });

  it("tartiblash: [t3, t1, t2] → order 1..3; to'liq bo'lmagan ro'yxat — 400, holat o'zgarmaydi", async () => {
    const tree = await suite.content.createTree();
    const [t1, t2, t3] = tree.topicIds;
    const orderPath = `/admin/sections/${tree.sectionId}/topics/order`;

    await suite.admin.api.put(orderPath, { topicIds: [t3, t1, t2] }).expect(204);
    expect(await topicOrder(tree.pathId, tree.sectionId)).toEqual([
      [t3, 1],
      [t1, 2],
      [t2, 3],
    ]);

    expectFieldError(await suite.admin.api.put(orderPath, { topicIds: [t1, t2] }), 'topicIds');
    expectFieldError(
      await suite.admin.api.put(orderPath, { topicIds: [t1, t2, randomUUID()] }),
      'topicIds',
    );
    expect(await topicOrder(tree.pathId, tree.sectionId)).toEqual([
      [t3, 1],
      [t1, 2],
      [t2, 3],
    ]);
  });

  it("parallel tartiblash va yaratish — 500 yo'q, unique buzilmaydi", async () => {
    const tree = await suite.content.createTree();
    const [t1, t2, t3] = tree.topicIds;
    const orderPath = `/admin/sections/${tree.sectionId}/topics/order`;

    const reorders = await Promise.all([
      suite.admin.api.put(orderPath, { topicIds: [t3, t2, t1] }),
      suite.admin.api.put(orderPath, { topicIds: [t2, t3, t1] }),
    ]);
    expect(reorders.map((response) => response.status)).toEqual([204, 204]);
    const orders = (await topicOrder(tree.pathId, tree.sectionId))?.map(([, order]) => order);
    expect(orders).toEqual([1, 2, 3]);

    const mixed = await Promise.all([
      suite.admin.api.post(`/admin/sections/${tree.sectionId}/topics`, { title: 'Parallel' }),
      suite.admin.api.put(orderPath, { topicIds: [t1, t2, t3] }),
    ]);
    mixed.forEach((response) => {
      expect(response.status).toBeLessThan(500);
    });
  });

  it("o'chirish: progressi bor dars — 409 HAS_PROGRESS; sandiq bog'langan mavzu — HAS_CHEST", async () => {
    const tree = await suite.content.createTree();
    const student = await context.fixtures.createUser({ role: Role.STUDENT });
    await suite.content.addLessonProgress(student.id, tree.lessonIds[0]);
    const chestId = await suite.content.createChest(tree.sectionId, tree.topicIds[1]);

    const lesson = await suite.admin.api.delete(`/admin/lessons/${tree.lessonIds[0]}`).expect(409);
    expect(lesson.body).toMatchObject({ error: { details: { reason: 'HAS_PROGRESS' } } });
    const section = await suite.admin.api.delete(`/admin/sections/${tree.sectionId}`).expect(409);
    expect(section.body).toMatchObject({ error: { details: { reason: 'HAS_PROGRESS' } } });
    const topic = await suite.admin.api.delete(`/admin/topics/${tree.topicIds[1]}`).expect(409);
    expect(topic.body).toMatchObject({ error: { details: { reason: 'HAS_CHEST', chestId } } });
  });

  it("progressiz bo'lim — 204 va kaskad (mavzular, darslar, sandiqlar)", async () => {
    const tree = await suite.content.createTree();
    await suite.content.createChest(tree.sectionId, tree.topicIds[0]);

    await suite.admin.api.delete(`/admin/sections/${tree.sectionId}`).expect(204);

    expect((await treeOf(suite.admin, tree.pathId)).sections).toEqual([]);
    await suite.admin.api.get(`/admin/lessons/${tree.lessonIds[0]}`).expect(404);
  });

  it("sandiq: boshqa bo'lim mavzusi — 400 afterTopicId; ikkinchi sandiq — 409 CHEST_EXISTS", async () => {
    const tree = await suite.content.createTree();
    const other = await suite.content.createTree();
    const chests = `/admin/sections/${tree.sectionId}/chests`;
    const body = { title: 'Sandiq', afterTopicId: tree.topicIds[0], reward: TEST_REWARD };

    expectFieldError(
      await suite.admin.api.post(chests, { ...body, afterTopicId: other.topicIds[0] }),
      'afterTopicId',
    );
    const created = await suite.admin.api.post(chests, body).expect(201);
    const duplicate = await suite.admin.api.post(chests, body).expect(409);
    expect(duplicate.body).toMatchObject({
      error: {
        code: ErrorCode.CONFLICT,
        details: { reason: 'CHEST_EXISTS', chestId: (created.body as { id: string }).id },
      },
    });
  });

  it("validatsiya: PATCH'da sectionId, javascript: videoUrl, noto'g'ri UUID, min > max — 400", async () => {
    const tree = await suite.content.createTree();

    expectFieldError(
      await suite.admin.api.patch(`/admin/topics/${tree.topicIds[0]}`, { sectionId: randomUUID() }),
      '',
    );
    expectFieldError(
      await suite.admin.api.patch(`/admin/lessons/${tree.lessonIds[0]}`, {
        videoUrl: 'javascript:alert(1)',
      }),
      'videoUrl',
    );
    expectFieldError(await suite.admin.api.get('/admin/lessons/not-a-uuid'), 'id');
    expectFieldError(
      await suite.admin.api.post(`/admin/sections/${tree.sectionId}/chests`, {
        title: 'S',
        afterTopicId: tree.topicIds[0],
        reward: { xp: { min: 5, max: 1 }, coin: { min: 0, max: 0 } },
      }),
      'reward.xp.max',
    );
  });

  it("ko'nikmalar: yaratish, nom band — 409 { field: name }; mavzuga biriktirish va olib tashlash", async () => {
    const tree = await suite.content.createTree();
    const name = `E2E-${uniqueSuffix()}`;
    const created = await suite.admin.api.post('/admin/skills', { name }).expect(201);
    const skill = created.body as SkillItem;
    suite.content.trackSkill(skill.id);

    const taken = await suite.admin.api.post('/admin/skills', { name }).expect(409);
    expect(taken.body).toMatchObject({ error: { details: { field: 'name' } } });

    const skillsPath = `/admin/topics/${tree.topicIds[0]}/skills`;
    expectFieldError(
      await suite.admin.api.put(skillsPath, { skillIds: [randomUUID()] }),
      'skillIds.0',
    );
    const set = await suite.admin.api.put(skillsPath, { skillIds: [skill.id] }).expect(200);
    expect((set.body as TopicSkillsResponse).skills).toEqual([{ id: skill.id, name, icon: null }]);
    const listed = await suite.admin.api.get(`/admin/skills?q=${name}`).expect(200);
    expect(listed.body).toMatchObject({ items: [{ id: skill.id, topicsCount: 1 }], total: 1 });
    const cleared = await suite.admin.api.put(skillsPath, { skillIds: [] }).expect(200);
    expect((cleared.body as TopicSkillsResponse).skills).toEqual([]);
  });
});
