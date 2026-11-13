import { AuditAction, ErrorCode, reorderTopicsSchema } from '@lms/shared';

import { ConcurrentModificationError } from '../../../common/exceptions/concurrent-modification.error.js';
import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { ContentOrderService, OrderLevel } from './content-order.service.js';

import type { LessonsRepository } from '../repositories/lessons.repository.js';
import type { PathSectionsRepository } from '../repositories/path-sections.repository.js';
import type { TopicsRepository } from '../repositories/topics.repository.js';

const T1 = '00000000-0000-4000-8000-000000000001';
const T2 = '00000000-0000-4000-8000-000000000002';
const T3 = '00000000-0000-4000-8000-000000000003';

function children(current: string[]) {
  return {
    lockParent: jest.fn().mockResolvedValue('p1'),
    childIds: jest.fn().mockResolvedValue(current),
    reorder: jest.fn().mockResolvedValue(undefined),
  };
}

function setup(current = ['t1', 't2', 't3']) {
  const sections = children(current);
  const topics = children(current);
  const lessons = children(current);
  const fakes = fakeKit();
  const service = new ContentOrderService(
    sections as unknown as PathSectionsRepository,
    topics as unknown as TopicsRepository,
    lessons as unknown as LessonsRepository,
    fakes.kit,
  );
  return { service, sections, topics, lessons, ...fakes };
}

describe('ContentOrderService', () => {
  it("to'liq permutatsiya: bitta reorder, ota auditi (ids oldin/keyin), versiya", async () => {
    const { service, topics, auditor, bumped } = setup();

    await service.reorder(OrderLevel.TOPICS, 's1', ['t3', 't1', 't2'], ACTOR);

    expect(topics.lockParent).toHaveBeenCalledWith('s1');
    expect(topics.reorder).toHaveBeenCalledWith('s1', ['t3', 't1', 't2']);
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_REORDERED,
      { type: 'PATH_SECTION', id: 's1' },
      ACTOR,
      { before: { ids: ['t1', 't2', 't3'] }, after: { ids: ['t3', 't1', 't2'] } },
    );
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it.each([
    ['yetishmagan', ['t1', 't2'], '1 ta yetishmaydi, 0 ta begona'],
    ['ortiqcha/begona', ['t1', 't2', 't3', 'x'], '0 ta yetishmaydi, 1 ta begona'],
    ['almashtirilgan', ['t1', 't2', 'x'], '1 ta yetishmaydi, 1 ta begona'],
  ])("%s id — 400 (field: topicIds), yozuv yo'q", async (_case, ids, counts) => {
    const { service, topics } = setup();

    await expect(service.reorder(OrderLevel.TOPICS, 's1', ids, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'topicIds', message: expect.stringContaining(counts) as string }],
    });
    expect(topics.reorder).not.toHaveBeenCalled();
  });

  it("tartib o'zgarmagan — yozuv, audit va versiya yo'q", async () => {
    const { service, lessons, auditor, bumped } = setup();

    await service.reorder(OrderLevel.LESSONS, 't1', ['t1', 't2', 't3'], ACTOR);

    expect(lessons.reorder).not.toHaveBeenCalled();
    expect(auditor.record).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("ota yo'q — 404; daraja bo'yicha to'g'ri repository va maydon", async () => {
    const { service, sections } = setup();
    sections.lockParent.mockResolvedValue(null);

    await expect(service.reorder(OrderLevel.SECTIONS, 'p1', ['t1'], ACTOR)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("poyga (qatorlar soni mos emas) — 409 CONFLICT, audit yo'q; boshqa xato — o'zgarishsiz", async () => {
    const { service, topics, auditor } = setup();
    topics.reorder.mockRejectedValueOnce(new ConcurrentModificationError("2 o'rniga 3"));

    await expect(
      service.reorder(OrderLevel.TOPICS, 's1', ['t3', 't1', 't2'], ACTOR),
    ).rejects.toMatchObject({ code: ErrorCode.CONFLICT });
    expect(auditor.record).not.toHaveBeenCalled();

    const other = new Error('db');
    topics.reorder.mockRejectedValueOnce(other);
    await expect(service.reorder(OrderLevel.TOPICS, 's1', ['t3', 't1', 't2'], ACTOR)).rejects.toBe(
      other,
    );
  });

  it('takror id — sxema darajasida 400', () => {
    expect(reorderTopicsSchema.safeParse({ topicIds: [T1, T2, T1] }).success).toBe(false);
    expect(reorderTopicsSchema.safeParse({ topicIds: [T1, T2, T3] }).success).toBe(true);
  });
});
