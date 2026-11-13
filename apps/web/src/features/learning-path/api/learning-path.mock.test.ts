import { beforeEach, describe, expect, it } from 'vitest';

import { ErrorCode } from '@lms/shared';

import { ChestStatus, LessonStatus, TopicStatus } from '../types/learning-path.types';

import { learningPathMockApi as api, resetLearningPathMock } from './learning-path.mock';

import type { StudentPathMap } from '../types/learning-path.types';

function nodeStatus(map: StudentPathMap, id: string): string | undefined {
  return map.sections.flatMap((section) => section.nodes).find((node) => node.id === id)?.status;
}

describe('learningPathMockApi', () => {
  beforeEach(() => {
    resetLearningPathMock();
  });

  it("boshlang'ich xarita: 1-mavzu jarayonda, keyingisi va sandiq qulflangan", async () => {
    const map = await api.getPathMap();
    expect(map.path?.title).toBe('Frontend dasturchi');
    expect(map.path?.progress).toBe(0);
    expect(nodeStatus(map, 'topic-html-tags')).toBe(TopicStatus.IN_PROGRESS);
    expect(nodeStatus(map, 'chest-html-1')).toBe(ChestStatus.LOCKED);
    expect(nodeStatus(map, 'topic-html-forms')).toBe(TopicStatus.LOCKED);
  });

  it("qulflangan mavzu — 403 LOCKED, noma'lum — 404 NOT_FOUND", async () => {
    await expect(api.getTopic('topic-html-forms')).rejects.toMatchObject({
      code: ErrorCode.LOCKED,
      status: 403,
    });
    await expect(api.getLesson('nope')).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  it('dars tugatilsa: mavzu COMPLETED, sandiq READY, keyingi mavzu ochiladi, next qaytadi', async () => {
    const result = await api.completeLesson('lesson-tags-text');
    expect(result).toEqual({
      lessonStatus: LessonStatus.COMPLETED,
      topicStatus: TopicStatus.COMPLETED,
      rewards: [],
      next: { topicId: 'topic-html-forms', lessonId: 'lesson-forms-input' },
    });
    const map = await api.getPathMap();
    expect(nodeStatus(map, 'chest-html-1')).toBe(ChestStatus.READY);
    expect(nodeStatus(map, 'topic-html-forms')).toBe(TopicStatus.AVAILABLE);
    const topic = await api.getTopic('topic-html-forms');
    expect(topic.lessons.map((lesson) => lesson.status)).toEqual([
      LessonStatus.AVAILABLE,
      LessonStatus.LOCKED,
    ]);
  });

  it("start: AVAILABLE dars IN_PROGRESS bo'ladi (idempotent)", async () => {
    await api.completeLesson('lesson-tags-text');
    const first = await api.startLesson('lesson-forms-input');
    const second = await api.startLesson('lesson-forms-input');
    expect(first.lessonStatus).toBe(LessonStatus.IN_PROGRESS);
    expect(first.topicStatus).toBe(TopicStatus.IN_PROGRESS);
    expect(second.startedAt).toBe(first.startedAt);
    const lesson = await api.getLesson('lesson-forms-input');
    expect(lesson.status).toBe(LessonStatus.IN_PROGRESS);
    expect(lesson.prevLessonId).toBeNull();
    expect(lesson.nextLessonId).toBe('lesson-forms-submit');
  });

  it('qulflangan darsni boshlash — 403 LOCKED', async () => {
    await expect(api.startLesson('lesson-forms-submit')).rejects.toMatchObject({
      code: ErrorCode.LOCKED,
    });
  });
});
