import { randomUUID } from 'node:crypto';

import { ContentStatus, ErrorCode } from '@lms/shared';
import type {
  LessonCompleteResponse,
  LessonStartResponse,
  StudentLesson,
  StudentTopicDetail,
} from '@lms/shared';

import { PrismaService } from '../src/infra/prisma/prisma.service.js';

import { useContentSuite } from './support/content-api.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  bumpContentVersion,
  createPublishedPath,
  enrollmentsOf,
  lessonAt,
  pathMapOf,
  studentSession,
  topicAt,
  topicStatuses,
} from './support/learning-fixtures.js';

/**
 * 3.3 — student ilm yo'li (docs/12 §4, 3.3 §9.2): bo'sh xarita, ochish ssenariysi, progress, scope
 * (begona/nashr qilinmagan — 404), lazy enrollment.
 */
describe("Student ilm yo'li — xarita, ochish, progress, scope (e2e)", () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it("guruhsiz student — bo'sh xarita (path: null, currentTopicId: null), enrollment yo'q", async () => {
    const student = await studentSession(context.app, context.fixtures);

    await expect(pathMapOf(student.api)).resolves.toEqual({
      path: null,
      currentTopicId: null,
      reviewBlock: { blocked: false, dueCount: 0 },
      sections: [],
    });
    await expect(enrollmentsOf(context.app, student.user.id)).resolves.toEqual([]);
  });

  it('ochish ssenariysi: dars ketma-ket, mavzu yakunlanadi → keyingisi AVAILABLE, sandiq READY, progress', async () => {
    const path = await createPublishedPath(suite.content, [[2, 1], [1]]);
    const [t1, t2, t3] = [topicAt(path, 0), topicAt(path, 1), topicAt(path, 2)];
    const chestId = await suite.content.createChest(t1.sectionId, t1.id);
    await bumpContentVersion(context.app, path.pathId);
    const { api, user } = await studentSession(context.app, context.fixtures, path.pathId);

    const fresh = await pathMapOf(api);
    expect(fresh).toMatchObject({ path: { id: path.pathId, progress: 0 }, currentTopicId: t1.id });
    expect(topicStatuses(fresh)).toEqual({
      [t1.id]: 'AVAILABLE',
      [t2.id]: 'LOCKED',
      [t3.id]: 'LOCKED',
    });
    expect(fresh.sections[0]?.nodes[1]).toEqual({
      kind: 'CHEST',
      id: chestId,
      title: 'E2E sandiq',
      status: 'LOCKED',
    });

    const topic = (await api.get(`/student/topics/${t1.id}`).expect(200))
      .body as StudentTopicDetail;
    expect(topic.lessons.map((lesson) => lesson.status)).toEqual(['AVAILABLE', 'LOCKED']);
    await api.get(`/student/lessons/${lessonAt(path, 0, 1)}`).expect(403);
    const locked = await api.get(`/student/topics/${t2.id}`).expect(403);
    expect((locked.body as { error: { code: string } }).error.code).toBe(ErrorCode.LOCKED);
    await api.post(`/student/lessons/${lessonAt(path, 1, 0)}/start`).expect(403);

    const lesson = (await api.get(`/student/lessons/${lessonAt(path, 0, 0)}`).expect(200))
      .body as StudentLesson;
    expect(lesson).toMatchObject({
      status: 'AVAILABLE',
      contentMd: '',
      topic: { id: t1.id },
      prevLessonId: null,
      nextLessonId: lessonAt(path, 0, 1),
      startedAt: null,
      completedAt: null,
    });

    const started = (await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/start`).expect(200))
      .body as LessonStartResponse;
    expect(started).toMatchObject({
      lessonId: lessonAt(path, 0, 0),
      lessonStatus: 'IN_PROGRESS',
      topicStatus: 'IN_PROGRESS',
    });
    const again = (await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/start`).expect(200))
      .body as LessonStartResponse;
    expect(again.startedAt).toBe(started.startedAt);

    const first = (await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/complete`).expect(200))
      .body as LessonCompleteResponse;
    expect(first).toEqual({
      lessonStatus: 'COMPLETED',
      topicStatus: 'IN_PROGRESS',
      rewards: [],
      next: { topicId: t1.id, lessonId: lessonAt(path, 0, 1) },
    });
    const afterFirst = await pathMapOf(api);
    expect(afterFirst.sections[0]?.nodes[0]).toMatchObject({
      status: 'IN_PROGRESS',
      lessons: 2,
      lessonsCompleted: 1,
    });

    // Boshlanmagan darsni yakunlash — avtomatik start (T-5).
    const second = (await api.post(`/student/lessons/${lessonAt(path, 0, 1)}/complete`).expect(200))
      .body as LessonCompleteResponse;
    expect(second).toMatchObject({
      topicStatus: 'COMPLETED',
      next: { topicId: t2.id, lessonId: lessonAt(path, 1, 0) },
    });
    await api.post(`/student/lessons/${lessonAt(path, 0, 1)}/complete`).expect(200);

    const afterTopic = await pathMapOf(api);
    expect(topicStatuses(afterTopic)).toEqual({
      [t1.id]: 'COMPLETED',
      [t2.id]: 'AVAILABLE',
      [t3.id]: 'LOCKED',
    });
    expect(afterTopic.sections[0]).toMatchObject({
      progress: 0.5,
      nodes: [{}, { kind: 'CHEST', status: 'READY' }, {}],
    });
    expect(afterTopic).toMatchObject({ currentTopicId: t2.id, path: { progress: 1 / 3 } });

    const row = await context.app.get(PrismaService).db.topicProgress.findUniqueOrThrow({
      where: { studentId_topicId: { studentId: user.id, topicId: t1.id } },
    });
    expect(row).toMatchObject({ status: 'COMPLETED', lessonsCompleted: 2 });

    await api.post(`/student/lessons/${lessonAt(path, 1, 0)}/complete`).expect(200);
    const last = (await api.post(`/student/lessons/${lessonAt(path, 2, 0)}/complete`).expect(200))
      .body as LessonCompleteResponse;
    expect(last).toMatchObject({ topicStatus: 'COMPLETED', next: null });
    await expect(pathMapOf(api)).resolves.toMatchObject({
      currentTopicId: null,
      path: { progress: 1 },
    });
    const [enrollment] = await enrollmentsOf(context.app, user.id);
    expect(enrollment?.completedAt).toBeInstanceOf(Date);
  });

  it("scope: boshqa yo'l mavzusi/darsi — 404; yo'q id — 404; UUID emas — 400", async () => {
    const own = await createPublishedPath(suite.content, [[1]]);
    const other = await createPublishedPath(suite.content, [[1]]);
    const { api } = await studentSession(context.app, context.fixtures, own.pathId);

    await api.get(`/student/topics/${topicAt(other, 0).id}`).expect(404);
    await api.get(`/student/lessons/${lessonAt(other, 0, 0)}`).expect(404);
    await api.post(`/student/lessons/${lessonAt(other, 0, 0)}/complete`).expect(404);
    await api.get(`/student/lessons/${randomUUID()}`).expect(404);
    await api.get('/student/topics/not-a-uuid').expect(400);
  });

  it("zanjirning har bir bo'g'ini: DRAFT dars / mavzu / bo'lim ichidagi PUBLISHED dars — 404", async () => {
    const path = await createPublishedPath(suite.content, [[1]]);
    const published = ContentStatus.PUBLISHED;
    const t1 = topicAt(path, 0);
    const draftLesson = await suite.content.createLesson(t1.id, { order: 99 });
    const draftTopic = await suite.content.createTopic(t1.sectionId, { order: 99 });
    const inDraftTopic = await suite.content.createLesson(draftTopic, { status: published });
    const draftSection = await suite.content.createSection(path.pathId, { order: 99 });
    const topicInDraftSection = await suite.content.createTopic(draftSection, {
      status: published,
    });
    const inDraftSection = await suite.content.createLesson(topicInDraftSection, {
      status: published,
    });
    await bumpContentVersion(context.app, path.pathId);
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);

    for (const lessonId of [draftLesson, inDraftTopic, inDraftSection]) {
      await api.get(`/student/lessons/${lessonId}`).expect(404);
    }
    await api.get(`/student/topics/${draftTopic}`).expect(404);
    expect(Object.keys(topicStatuses(await pathMapOf(api)))).toEqual([t1.id]);

    await context.app.get(PrismaService).db.learningPath.update({
      where: { id: path.pathId },
      data: { status: ContentStatus.DRAFT },
    });
    await expect(pathMapOf(api)).resolves.toMatchObject({ path: null, sections: [] });
    await api.get(`/student/lessons/${lessonAt(path, 0, 0)}`).expect(404);
  });

  it("nashr zanjiri (admin API): dars yashiriladi → lessons darhol kamayadi; yo'l DRAFT → bo'sh; qayta nashr → progress joyida", async () => {
    const path = await createPublishedPath(suite.content, [[2, 1]]);
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/complete`).expect(200);
    expect((await pathMapOf(api)).sections[0]?.nodes[0]).toMatchObject({
      lessons: 2,
      lessonsCompleted: 1,
    });

    await suite.admin.api
      .patch(`/admin/lessons/${lessonAt(path, 0, 1)}`, { status: 'DRAFT' })
      .expect(200);
    expect((await pathMapOf(api)).sections[0]?.nodes[0]).toMatchObject({
      lessons: 1,
      lessonsCompleted: 1,
    });

    await suite.admin.api.patch(`/admin/paths/${path.pathId}`, { status: 'DRAFT' }).expect(200);
    await expect(pathMapOf(api)).resolves.toMatchObject({ path: null });
    await suite.admin.api.patch(`/admin/paths/${path.pathId}`, { status: 'PUBLISHED' }).expect(200);
    const back = await pathMapOf(api);
    expect(back.sections[0]?.nodes[0]).toMatchObject({
      id: topicAt(path, 0).id,
      lessonsCompleted: 1,
    });
  });
});
