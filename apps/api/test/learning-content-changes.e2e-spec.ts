import { ContentStatus } from '@lms/shared';
import type { StudentTopicDetail } from '@lms/shared';

import { useContentSuite } from './support/content-api.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  bumpContentVersion,
  createPublishedPath,
  lessonAt,
  ORDER_STEP,
  pathMapOf,
  studentOnNewPath,
  studentSession,
  topicAt,
  topicStatuses,
} from './support/learning-fixtures.js';

import type { ApiClient } from './support/group-api.js';
import type { PublishedPath } from './support/learning-fixtures.js';

const PUBLISHED = ContentStatus.PUBLISHED;

async function completeTopic(
  api: ApiClient,
  path: PublishedPath,
  topicIndex: number,
): Promise<void> {
  for (const lessonId of topicAt(path, topicIndex).lessonIds) {
    await api.post(`/student/lessons/${lessonId}/complete`).expect(200);
  }
}

/**
 * 3.3 §4.8, §4.10 — kontent o'zgarishi (S-35): o'rtaga qo'shilgan mavzu, faqat `AVAILABLE` qatorli
 * mavzuni ko'chirish (🔴-1), yakunlangan mavzuga yangi dars (S-B2), reconcile, qayta tartiblash.
 */
describe("Student ilm yo'li — kontent o'zgarishi (e2e)", () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it('S-35: 1–2 mavzu tugagan, orasiga yangi mavzu — u AVAILABLE, 2-mavzu COMPLETED, 3-mavzu ochiq', async () => {
    const path = await createPublishedPath(suite.content, [[1, 1, 1]]);
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    await completeTopic(api, path, 0);
    await completeTopic(api, path, 1);

    const inserted = await suite.content.createTopic(topicAt(path, 0).sectionId, {
      status: PUBLISHED,
      order: ORDER_STEP + 1,
    });
    await suite.content.createLesson(inserted, { status: PUBLISHED });
    await bumpContentVersion(context.app, path.pathId);

    const map = await pathMapOf(api);
    expect(topicStatuses(map)).toEqual({
      [topicAt(path, 0).id]: 'COMPLETED',
      [inserted]: 'AVAILABLE',
      [topicAt(path, 1).id]: 'COMPLETED',
      [topicAt(path, 2).id]: 'AVAILABLE',
    });
    expect(map.currentTopicId).toBe(topicAt(path, 2).id);
  });

  it("🔴-1: yangi student (faqat t1 AVAILABLE qatori), admin t1 ni oxiriga ko'chiradi — t3 LOCKED (403)", async () => {
    const path = await createPublishedPath(suite.content, [[1, 1, 1]]);
    const [t1, t2, t3] = [topicAt(path, 0), topicAt(path, 1), topicAt(path, 2)];
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    await pathMapOf(api);

    await suite.admin.api
      .put(`/admin/sections/${t1.sectionId}/topics/order`, { topicIds: [t2.id, t3.id, t1.id] })
      .expect(204);

    const map = await pathMapOf(api);
    expect(topicStatuses(map)).toEqual({
      [t2.id]: 'AVAILABLE',
      [t3.id]: 'LOCKED',
      [t1.id]: 'AVAILABLE',
    });
    expect(map.currentTopicId).toBe(t1.id);
    await api.get(`/student/topics/${t3.id}`).expect(403);
  });

  it("qayta tartiblash: IN_PROGRESS qatorli mavzu oxiriga ko'chsa ham qulflanmaydi", async () => {
    const path = await createPublishedPath(suite.content, [[2, 1, 1]]);
    const [t1, t2, t3] = [topicAt(path, 0), topicAt(path, 1), topicAt(path, 2)];
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/start`).expect(200);

    await suite.admin.api
      .put(`/admin/sections/${t1.sectionId}/topics/order`, { topicIds: [t2.id, t3.id, t1.id] })
      .expect(204);

    expect(topicStatuses(await pathMapOf(api))).toEqual({
      [t2.id]: 'AVAILABLE',
      [t3.id]: 'AVAILABLE',
      [t1.id]: 'IN_PROGRESS',
    });
  });

  it('S-B2: COMPLETED mavzuga yangi dars — mavzu COMPLETED qoladi, yangi dars AVAILABLE', async () => {
    const path = await createPublishedPath(suite.content, [[1, 1]]);
    const t1 = topicAt(path, 0);
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    await completeTopic(api, path, 0);

    const added = await suite.content.createLesson(t1.id, {
      status: PUBLISHED,
      order: ORDER_STEP * 2,
    });
    await bumpContentVersion(context.app, path.pathId);

    const topic = (await api.get(`/student/topics/${t1.id}`).expect(200))
      .body as StudentTopicDetail;
    expect(topic).toMatchObject({ status: 'COMPLETED', lessonsCompleted: 1 });
    expect(topic.lessons.find((lesson) => lesson.id === added)?.status).toBe('AVAILABLE');
    expect(topicStatuses(await pathMapOf(api))[topicAt(path, 1).id]).toBe('AVAILABLE');
  });

  it('reconcile: 1-dars tugagan, admin 2-darsni arxivlaydi — mavzu COMPLETED, keyingisi AVAILABLE', async () => {
    const { path, api } = await studentOnNewPath(context, suite.content, [[2, 1]]);
    await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/complete`).expect(200);

    await suite.admin.api
      .patch(`/admin/lessons/${lessonAt(path, 0, 1)}`, { status: 'ARCHIVED' })
      .expect(200);

    const map = await pathMapOf(api);
    expect(topicStatuses(map)).toEqual({
      [topicAt(path, 0).id]: 'COMPLETED',
      [topicAt(path, 1).id]: 'AVAILABLE',
    });
    expect(map.currentTopicId).toBe(topicAt(path, 1).id);
  });
});
