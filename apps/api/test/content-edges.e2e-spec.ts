import { randomUUID } from 'node:crypto';

import { ContentStatus, ErrorCode, Role } from '@lms/shared';

import {
  contentAuditRows,
  sectionIn,
  topicIn,
  treeOf,
  useContentSuite,
} from './support/content-api.js';
import { useE2eContext } from './support/e2e-context.js';
import { mentorSessionOf } from './support/group-api.js';

/**
 * 3.2 §8.2 qo'shimcha chegaraviy holatlar (sinchkov-tester): chuqur 🟡-5 kaskad, idempotent nashr,
 * faqat `topic_progress` bilan `HAS_PROGRESS`, guruhsiz `PATH_IN_USE`, begona id bilan tartiblash,
 * mavjud bo'lmagan UUID — 404, mentor daraxtda barcha statuslarni ko'radi (S-C2).
 */
describe('Kontent API — chegaraviy holatlar (e2e)', () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it("🟡-5: ARCHIVED bo'lim ichidagi DRAFT mavzuning DRAFT darsi ham DRAFT qoladi", async () => {
    const tree = await suite.content.createTree();
    const archivedSection = await suite.content.createSection(tree.pathId, {
      order: 2,
      status: ContentStatus.ARCHIVED,
    });
    const innerTopic = await suite.content.createTopic(archivedSection);
    const innerLesson = await suite.content.createLesson(innerTopic);

    await suite.admin.api
      .post(`/admin/paths/${tree.pathId}/publish`, { cascade: true })
      .expect(200);

    const after = await treeOf(suite.admin, tree.pathId);
    expect(sectionIn(after, archivedSection)?.status).toBe(ContentStatus.ARCHIVED);
    expect(topicIn(after, innerTopic)).toMatchObject({
      status: ContentStatus.DRAFT,
      lessons: [{ id: innerLesson, status: ContentStatus.DRAFT }],
    });
  });

  it("nashr idempotent: PUBLISHED yo'l, body'siz publish — versiya va audit o'zgarmaydi; cascade — faqat bolalar", async () => {
    const tree = await suite.content.createTree();
    const publishPath = `/admin/paths/${tree.pathId}/publish`;
    await suite.admin.api.post(publishPath).expect(200);
    const version = await suite.content.version(tree.pathId);
    const auditCount = (await contentAuditRows(context.app, tree.pathId)).length;

    await suite.admin.api.post(publishPath).expect(200);
    expect(await suite.content.version(tree.pathId)).toBe(version);
    expect(await contentAuditRows(context.app, tree.pathId)).toHaveLength(auditCount);

    await suite.admin.api.post(publishPath, { cascade: true }).expect(200);
    expect(await suite.content.version(tree.pathId)).toBe(version + 1);
    const rows = await contentAuditRows(context.app, tree.pathId);
    expect(rows).toHaveLength(auditCount + 1);
    expect(rows.at(-1)?.after).toMatchObject({
      cascade: true,
      published: { sections: 1, topics: 3, lessons: 3 },
    });
  });

  it("faqat topic_progress bor mavzu/bo'lim — 409 HAS_PROGRESS; uning darsi — 204", async () => {
    const tree = await suite.content.createTree();
    const student = await context.fixtures.createUser({ role: Role.STUDENT });
    await suite.content.addTopicProgress(student.id, tree.topicIds[0]);
    const hasProgress = {
      error: { code: ErrorCode.CONFLICT, details: { reason: 'HAS_PROGRESS' } },
    };

    const topic = await suite.admin.api.delete(`/admin/topics/${tree.topicIds[0]}`).expect(409);
    expect(topic.body).toMatchObject(hasProgress);
    const section = await suite.admin.api.delete(`/admin/sections/${tree.sectionId}`).expect(409);
    expect(section.body).toMatchObject(hasProgress);
    await suite.admin.api.delete(`/admin/lessons/${tree.lessonIds[0]}`).expect(204);
  });

  it("guruhsiz, lekin progressi bor yo'l — 409 PATH_IN_USE, groupsCount 0", async () => {
    const tree = await suite.content.createTree();
    const student = await context.fixtures.createUser({ role: Role.STUDENT });
    await suite.content.addLessonProgress(student.id, tree.lessonIds[1]);

    const response = await suite.admin.api.delete(`/admin/paths/${tree.pathId}`).expect(409);
    expect(response.body).toMatchObject({
      error: { code: ErrorCode.CONFLICT, details: { reason: 'PATH_IN_USE', groupsCount: 0 } },
    });
    await suite.admin.api.get(`/admin/paths/${tree.pathId}`).expect(200);
  });

  it("tartiblash: begona bo'lim/dars id, takror id — 400 VALIDATION_ERROR", async () => {
    const tree = await suite.content.createTree();
    const other = await suite.content.createTree();
    const invalid = { error: { code: ErrorCode.VALIDATION_ERROR } };

    const sections = await suite.admin.api
      .put(`/admin/paths/${tree.pathId}/sections/order`, { sectionIds: [other.sectionId] })
      .expect(400);
    expect(sections.body).toMatchObject(invalid);
    const lessons = await suite.admin.api
      .put(`/admin/topics/${tree.topicIds[0]}/lessons/order`, { lessonIds: [tree.lessonIds[1]] })
      .expect(400);
    expect(lessons.body).toMatchObject(invalid);
    const [t1, t2] = tree.topicIds;
    await suite.admin.api
      .put(`/admin/sections/${tree.sectionId}/topics/order`, { topicIds: [t1, t2, t1] })
      .expect(400);
  });

  it("mavjud bo'lmagan UUID — 404 NOT_FOUND (GET, publish, PATCH, DELETE)", async () => {
    const id = randomUUID();
    const requests = [
      suite.admin.api.get(`/admin/paths/${id}`),
      suite.admin.api.get(`/admin/paths/${id}/tree`),
      suite.admin.api.post(`/admin/paths/${id}/publish`),
      suite.admin.api.patch(`/admin/sections/${id}`, { title: 'X' }),
      suite.admin.api.post(`/admin/topics/${id}/lessons`, { title: 'X' }),
      suite.admin.api.delete(`/admin/lessons/${id}`),
      suite.admin.api.patch(`/admin/chests/${id}`, { title: 'X' }),
    ];

    for (const response of await Promise.all(requests)) {
      expect({ status: response.status, body: response.body as unknown }).toMatchObject({
        status: 404,
        body: { error: { code: ErrorCode.NOT_FOUND } },
      });
    }
  });

  it('mentor (S-C2): daraxtda barcha statuslar; GET /admin/paths?status=ARCHIVED — 200', async () => {
    const mentor = await mentorSessionOf(context.app, context.fixtures);
    const tree = await suite.content.createTree();
    const archivedLesson = await suite.content.createLesson(tree.topicIds[0], {
      order: 2,
      status: ContentStatus.ARCHIVED,
    });

    const after = await treeOf(mentor, tree.pathId);
    expect(after.path.status).toBe(ContentStatus.DRAFT);
    expect(topicIn(after, tree.topicIds[0])?.lessons.map((lesson) => lesson.id)).toEqual([
      tree.lessonIds[0],
      archivedLesson,
    ]);
    await mentor.api.get('/admin/paths?status=ARCHIVED').expect(200);
  });
});
