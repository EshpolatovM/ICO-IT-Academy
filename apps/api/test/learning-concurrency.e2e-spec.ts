import { PrismaService } from '../src/infra/prisma/prisma.service.js';
import { RedisService } from '../src/infra/redis/redis.service.js';

import { useContentSuite } from './support/content-api.js';
import { useE2eContext } from './support/e2e-context.js';
import {
  createPublishedPath,
  enrollmentsOf,
  lessonAt,
  pathMapOf,
  studentSession,
  topicAt,
  topicStatuses,
} from './support/learning-fixtures.js';

/**
 * 3.3 §9.2 — idempotentlik va parallellik (poygaga chidamli SQL, §3.4/§4.7) hamda Redis ishlamay
 * qolganda xarita DB'dan qaytishi (500 yo'q).
 */
describe("Student ilm yo'li — parallellik va kesh xatosi (e2e)", () => {
  const context = useE2eContext();
  const suite = useContentSuite(context);

  it('ikki parallel birinchi GET /student/path — bitta enrollment va bitta 1-mavzu qatori', async () => {
    const path = await createPublishedPath(suite.content, [[1, 1]]);
    const { api, user } = await studentSession(context.app, context.fixtures, path.pathId);

    const responses = await Promise.all([api.get('/student/path'), api.get('/student/path')]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    await expect(enrollmentsOf(context.app, user.id)).resolves.toHaveLength(1);
    const rows = await context.app
      .get(PrismaService)
      .db.topicProgress.findMany({ where: { studentId: user.id } });
    expect(rows).toEqual([
      expect.objectContaining({ topicId: topicAt(path, 0).id, status: 'AVAILABLE' }),
    ]);
  });

  it("bitta darsning ikki parallel complete — ikkalasi 200, bitta o'tish (lessons_completed = 1)", async () => {
    const path = await createPublishedPath(suite.content, [[2]]);
    const { api, user } = await studentSession(context.app, context.fixtures, path.pathId);
    const lessonPath = `/student/lessons/${lessonAt(path, 0, 0)}/complete`;

    const responses = await Promise.all([api.post(lessonPath), api.post(lessonPath)]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    const row = await context.app.get(PrismaService).db.topicProgress.findUniqueOrThrow({
      where: { studentId_topicId: { studentId: user.id, topicId: topicAt(path, 0).id } },
    });
    expect(row).toMatchObject({ status: 'IN_PROGRESS', lessonsCompleted: 1 });
  });

  it('bir mavzudagi oxirgi ikki darsning parallel complete — mavzu COMPLETED, keyingisi AVAILABLE', async () => {
    const path = await createPublishedPath(suite.content, [[2, 1]]);
    const { api, user } = await studentSession(context.app, context.fixtures, path.pathId);
    await pathMapOf(api);
    // Ikkala dars ham boshlangan (ochiq, yakunlanmagan) — mavzu yakunlanishi ikkinchi commit'ga bog'liq.
    await suite.content.addLessonProgress(user.id, lessonAt(path, 0, 0));
    await suite.content.addLessonProgress(user.id, lessonAt(path, 0, 1));

    const responses = await Promise.all([
      api.post(`/student/lessons/${lessonAt(path, 0, 0)}/complete`),
      api.post(`/student/lessons/${lessonAt(path, 0, 1)}/complete`),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(
      responses.map((response) => (response.body as { topicStatus: string }).topicStatus),
    ).toContain('COMPLETED');
    expect(topicStatuses(await pathMapOf(api))).toEqual({
      [topicAt(path, 0).id]: 'COMPLETED',
      [topicAt(path, 1).id]: 'AVAILABLE',
    });
  });

  it('Redis ishlamayapti — xarita DB dan (200), complete ham ishlaydi', async () => {
    const path = await createPublishedPath(suite.content, [[1, 1]]);
    const { api } = await studentSession(context.app, context.fixtures, path.pathId);
    const redis = context.app.get(RedisService);
    const down = () => Promise.reject(new Error('redis: connection lost'));
    const spies = [
      jest.spyOn(redis, 'get').mockImplementation(down),
      jest.spyOn(redis, 'set').mockImplementation(down),
      jest.spyOn(redis, 'setIfVersion').mockImplementation(down),
      jest.spyOn(redis, 'bumpVersionsAndDelete').mockImplementation(down),
    ];
    try {
      await expect(pathMapOf(api)).resolves.toMatchObject({ path: { id: path.pathId } });
      await api.post(`/student/lessons/${lessonAt(path, 0, 0)}/complete`).expect(200);
      expect(topicStatuses(await pathMapOf(api))[topicAt(path, 1).id]).toBe('AVAILABLE');
      expect(spies[0]).toHaveBeenCalled();
    } finally {
      spies.forEach((spy) => {
        spy.mockRestore();
      });
    }
  });
});
