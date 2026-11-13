import { ContentStatus, ErrorCode } from '@lms/shared';

import { ACTOR, CREATED_AT, fakeKit, UPDATED_AT } from '../testing/content.fixtures.js';

import { LessonsService } from './lessons.service.js';

import type { LessonDetailRecord } from '../content.types.js';
import type { LessonsRepository } from '../repositories/lessons.repository.js';

const LESSON: LessonDetailRecord = {
  id: 'l1',
  parentId: 't1',
  pathId: 'p1',
  order: 1,
  title: 'Teglar',
  contentMd: '# Salom',
  videoUrl: null,
  estMinutes: 10,
  status: ContentStatus.DRAFT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
  topic: { id: 't1', title: 'HTML' },
  path: { id: 'p1', title: 'Frontend' },
};

function setup(found: LessonDetailRecord | null = LESSON) {
  const lessons = {
    lockParent: jest.fn().mockResolvedValue('p1'),
    nextOrder: jest.fn().mockResolvedValue(2),
    createNode: jest.fn().mockResolvedValue({ id: 'l1' }),
    lockRecord: jest.fn().mockResolvedValue(found),
    applyChanges: jest.fn().mockResolvedValue(undefined),
    findDetail: jest.fn().mockResolvedValue(found),
  };
  const fakes = fakeKit();
  const service = new LessonsService(lessons as unknown as LessonsRepository, fakes.kit);
  return { service, lessons, ...fakes };
}

describe('LessonsService', () => {
  it("yaratish: contentMd standart '', videoUrl/estMinutes — null", async () => {
    const { service, lessons } = setup();

    await service.create('t1', { title: 'Teglar' }, ACTOR);

    expect(lessons.createNode).toHaveBeenCalledWith({
      parentId: 't1',
      order: 2,
      fields: { title: 'Teglar', contentMd: '', videoUrl: null, estMinutes: null },
    });
  });

  it("tafsilot: ISO vaqtlar, mavzu va yo'l bilan; yo'q — 404", async () => {
    await expect(setup().service.get('l1')).resolves.toEqual({
      id: 'l1',
      order: 1,
      title: 'Teglar',
      contentMd: '# Salom',
      videoUrl: null,
      estMinutes: 10,
      status: ContentStatus.DRAFT,
      createdAt: CREATED_AT.toISOString(),
      updatedAt: UPDATED_AT.toISOString(),
      topic: { id: 't1', title: 'HTML' },
      path: { id: 'p1', title: 'Frontend' },
    });
    await expect(setup(null).service.get('l1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it('PATCH: null — tozalash (videoUrl), bir xil qiymat — diff emas', async () => {
    const { service, lessons } = setup({ ...LESSON, videoUrl: 'https://youtu.be/x' });

    await service.update('l1', { videoUrl: null, estMinutes: 10 }, ACTOR);

    expect(lessons.applyChanges).toHaveBeenCalledWith('l1', { videoUrl: null });
  });
});
