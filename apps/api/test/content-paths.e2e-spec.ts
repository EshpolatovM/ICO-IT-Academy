import { ContentStatus, ErrorCode } from '@lms/shared';
import type { AdminPathDetail, AdminPathsResponse } from '@lms/shared';

import { treeOf, sectionIn, topicIn, useContentSuite } from './support/content-api.js';
import { uniqueSuffix } from './support/content-fixtures.js';
import { useE2eContext } from './support/e2e-context.js';

/**
 * 3.2 — yo'llar: ro'yxat (`?status=`), yaratish (409 shakli, B-1), nashr zanjiri (R Q-3, R Q-8,
 * Domla 🟡-5), o'chirish (`PATH_IN_USE`), guruh yaratishda yo'l holati (R Q-6), kontent versiyasi.
 */
describe("Kontent API — yo'llar va nashr (e2e)", () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it('POST: DRAFT yaratiladi; slug band — 409, details obyekt `{ field: "slug" }`', async () => {
    const slug = `e2e-new-${uniqueSuffix()}`;
    const created = await suite.admin.api
      .post('/admin/paths', { title: 'E2E yangi', slug })
      .expect(201);
    const path = created.body as AdminPathDetail;
    suite.content.trackPath(path.id);

    expect(path).toMatchObject({ slug, status: ContentStatus.DRAFT, groupsCount: 0 });
    const taken = await suite.admin.api.post('/admin/paths', { title: 'Boshqa', slug }).expect(409);
    expect(taken.body).toEqual({
      error: {
        code: ErrorCode.CONFLICT,
        message: expect.any(String) as string,
        details: { field: 'slug' },
      },
    });
  });

  it('GET ?status=ARCHIVED — faqat arxivlanganlar; ?status=FOO — 400', async () => {
    const archived = await suite.content.createPath(ContentStatus.ARCHIVED);
    const draft = await suite.content.createPath(ContentStatus.DRAFT);

    const response = await suite.admin.api.get('/admin/paths?status=ARCHIVED').expect(200);
    const ids = (response.body as AdminPathsResponse).items.map((item) => item.id);
    expect(ids).toContain(archived.id);
    expect(ids).not.toContain(draft.id);
    expect(
      (response.body as AdminPathsResponse).items.every((item) => item.status === 'ARCHIVED'),
    ).toBe(true);
    await suite.admin.api.get('/admin/paths?status=FOO').expect(400);
  });

  it("publish (body'siz) — faqat yo'l; bolalar DRAFT qoladi; publish { foo: 1 } — 400", async () => {
    const tree = await suite.content.createTree();

    await suite.admin.api.post(`/admin/paths/${tree.pathId}/publish`, { foo: 1 }).expect(400);
    const published = await suite.admin.api.post(`/admin/paths/${tree.pathId}/publish`).expect(200);

    expect(published.body).toMatchObject({ status: ContentStatus.PUBLISHED });
    const after = await treeOf(suite.admin, tree.pathId);
    expect(sectionIn(after, tree.sectionId)?.status).toBe(ContentStatus.DRAFT);
    expect(topicIn(after, tree.topicIds[0])?.status).toBe(ContentStatus.DRAFT);
  });

  it('publish { cascade: true }: DRAFT bolalar PUBLISHED; ARCHIVED va ARCHIVED ota ichidagilari tegilmaydi', async () => {
    const tree = await suite.content.createTree();
    const archivedLesson = await suite.content.createLesson(tree.topicIds[0], {
      order: 2,
      status: ContentStatus.ARCHIVED,
    });
    const archivedSection = await suite.content.createSection(tree.pathId, {
      order: 2,
      status: ContentStatus.ARCHIVED,
    });
    const topicInArchived = await suite.content.createTopic(archivedSection);
    const archivedTopic = await suite.content.createTopic(tree.sectionId, {
      order: 4,
      status: ContentStatus.ARCHIVED,
    });
    const lessonInArchived = await suite.content.createLesson(archivedTopic);

    await suite.admin.api
      .post(`/admin/paths/${tree.pathId}/publish`, { cascade: true })
      .expect(200);

    const after = await treeOf(suite.admin, tree.pathId);
    const topic = topicIn(after, tree.topicIds[0]);
    expect(sectionIn(after, tree.sectionId)?.status).toBe(ContentStatus.PUBLISHED);
    expect(topic?.status).toBe(ContentStatus.PUBLISHED);
    expect(topic?.lessons.map((lesson) => [lesson.id, lesson.status])).toEqual([
      [tree.lessonIds[0], ContentStatus.PUBLISHED],
      [archivedLesson, ContentStatus.ARCHIVED],
    ]);
    expect(topicIn(after, topicInArchived)?.status).toBe(ContentStatus.DRAFT);
    expect(topicIn(after, archivedTopic)?.lessons[0]).toMatchObject({
      id: lessonInArchived,
      status: ContentStatus.DRAFT,
    });
  });

  it("PATCH yo'l { status: PUBLISHED } — faqat yo'l; PATCH bo'lim status — faqat bo'lim", async () => {
    const tree = await suite.content.createTree();

    await suite.admin.api
      .patch(`/admin/paths/${tree.pathId}`, { status: ContentStatus.PUBLISHED })
      .expect(200);
    await suite.admin.api
      .patch(`/admin/sections/${tree.sectionId}`, { status: ContentStatus.PUBLISHED })
      .expect(200);

    const after = await treeOf(suite.admin, tree.pathId);
    expect(after.path.status).toBe(ContentStatus.PUBLISHED);
    expect(sectionIn(after, tree.sectionId)?.status).toBe(ContentStatus.PUBLISHED);
    expect(topicIn(after, tree.topicIds[0])?.status).toBe(ContentStatus.DRAFT);
  });

  it("DELETE: guruh ishlatsa — 409 PATH_IN_USE (groupsCount raqam); bo'sh yo'l — 204 va kaskad", async () => {
    const { pathId } = await context.fixtures.createGroup();
    const used = await suite.admin.api.delete(`/admin/paths/${pathId}`).expect(409);
    expect(used.body).toMatchObject({
      error: { code: ErrorCode.CONFLICT, details: { reason: 'PATH_IN_USE', groupsCount: 1 } },
    });

    const tree = await suite.content.createTree();
    await suite.admin.api.delete(`/admin/paths/${tree.pathId}`).expect(204);
    await suite.admin.api.get(`/admin/paths/${tree.pathId}`).expect(404);
    await suite.admin.api.get(`/admin/lessons/${tree.lessonIds[0]}`).expect(404);
  });

  it("guruh (R Q-6): ARCHIVED yo'l — 400 pathId; DRAFT yo'l — 201", async () => {
    const archived = await suite.content.createPath(ContentStatus.ARCHIVED);
    const draft = await suite.content.createPath(ContentStatus.DRAFT);

    const rejected = await suite.admin.api
      .post('/admin/groups', { name: `E2E-${uniqueSuffix()}`, pathId: archived.id })
      .expect(400);
    expect(rejected.body).toMatchObject({
      error: { code: ErrorCode.VALIDATION_ERROR, details: [{ field: 'pathId' }] },
    });
    const created = await suite.admin.api
      .post('/admin/groups', { name: `E2E-${uniqueSuffix()}`, pathId: draft.id })
      .expect(201);
    context.fixtures.trackGroup((created.body as { id: string }).id);
  });

  it('kesh versiyasi: mutatsiyadan keyin oshadi, no-op PATCH — oshmaydi', async () => {
    const tree = await suite.content.createTree();
    const before = await suite.content.version(tree.pathId);

    await suite.admin.api
      .patch(`/admin/topics/${tree.topicIds[0]}`, { title: 'Yangi' })
      .expect(200);
    const afterPatch = await suite.content.version(tree.pathId);
    await suite.admin.api
      .patch(`/admin/topics/${tree.topicIds[0]}`, { title: 'Yangi' })
      .expect(200);

    expect(afterPatch).toBe(before + 1);
    expect(await suite.content.version(tree.pathId)).toBe(afterPatch);
  });

  it('2.3 regressiya: GET /admin/paths — eski maydonlar (id, title, slug, status) + yangi sonlar', async () => {
    const tree = await suite.content.createTree();

    const response = await suite.admin.api.get('/admin/paths').expect(200);
    const items = (response.body as AdminPathsResponse).items;
    expect(items.find((item) => item.id === tree.pathId)).toMatchObject({
      slug: expect.any(String) as string,
      status: ContentStatus.DRAFT,
      sectionsCount: 1,
      topicsCount: 3,
    });
  });
});
