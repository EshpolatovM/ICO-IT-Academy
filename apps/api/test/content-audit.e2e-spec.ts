import { AuditAction, ContentStatus } from '@lms/shared';

import { contentAuditRows, useContentSuite } from './support/content-api.js';
import { useE2eContext } from './support/e2e-context.js';

/** 3.2 §7 — kontent auditi: nashr (kaskad — bitta yozuv), tartiblash, o'chirish. */
describe('Kontent auditi (e2e)', () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it("publish { cascade: true } — yo'l uchun bitta CONTENT_STATUS_CHANGED sonlar bilan", async () => {
    const tree = await suite.content.createTree();

    await suite.admin.api
      .post(`/admin/paths/${tree.pathId}/publish`, { cascade: true })
      .expect(200);
    await suite.admin.api
      .post(`/admin/paths/${tree.pathId}/publish`, { cascade: true })
      .expect(200);

    expect(await contentAuditRows(context.app, tree.pathId)).toEqual([
      {
        action: AuditAction.CONTENT_STATUS_CHANGED,
        entityType: 'LEARNING_PATH',
        before: { status: ContentStatus.DRAFT },
        after: {
          status: ContentStatus.PUBLISHED,
          cascade: true,
          published: { sections: 1, topics: 3, lessons: 3 },
        },
      },
    ]);
  });

  it('PUT …/order — CONTENT_REORDERED (ota yozuvida ids oldin/keyin)', async () => {
    const tree = await suite.content.createTree();
    const [t1, t2, t3] = tree.topicIds;

    await suite.admin.api
      .put(`/admin/sections/${tree.sectionId}/topics/order`, { topicIds: [t3, t1, t2] })
      .expect(204);

    expect(await contentAuditRows(context.app, tree.sectionId)).toEqual([
      {
        action: AuditAction.CONTENT_REORDERED,
        entityType: 'PATH_SECTION',
        before: { ids: [t1, t2, t3] },
        after: { ids: [t3, t1, t2] },
      },
    ]);
  });

  it('DELETE dars — CONTENT_DELETED; PATCH contentMd — qiymati yozilmaydi', async () => {
    const tree = await suite.content.createTree();
    const [lessonId] = tree.lessonIds;

    await suite.admin.api
      .patch(`/admin/lessons/${lessonId}`, { contentMd: 'MAXFIY MATN' })
      .expect(200);
    await suite.admin.api.delete(`/admin/lessons/${lessonId}`).expect(204);

    const rows = await contentAuditRows(context.app, lessonId);
    expect(rows).toEqual([
      {
        action: AuditAction.CONTENT_UPDATED,
        entityType: 'LESSON',
        before: {},
        after: { changedFields: ['contentMd'] },
      },
      {
        action: AuditAction.CONTENT_DELETED,
        entityType: 'LESSON',
        before: { title: 'E2E dars', parentId: tree.topicIds[0] },
        after: null,
      },
    ]);
    expect(JSON.stringify(rows)).not.toContain('MAXFIY');
  });
});
