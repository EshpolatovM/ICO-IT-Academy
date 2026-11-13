import { AuditAction, createChestSchema, ErrorCode } from '@lms/shared';

import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../../common/exceptions/constraint-violation.error.js';
import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { ChestsService } from './chests.service.js';

import type { ChestRecord } from '../content.types.js';
import type { PathChestsRepository } from '../repositories/path-chests.repository.js';
import type { PathSectionsRepository } from '../repositories/path-sections.repository.js';
import type { TopicsRepository } from '../repositories/topics.repository.js';

const REWARD = { xp: { min: 50, max: 50 }, coin: { min: 10, max: 30 } };
const CHEST: ChestRecord = {
  id: 'c1',
  sectionId: 's1',
  pathId: 'p1',
  afterTopicId: 't1',
  title: 'Sandiq',
  reward: REWARD,
};
const REQUEST = { title: 'Sandiq', afterTopicId: 't1', reward: REWARD };

function setup({ topicSection = 's1', existing = null as string | null } = {}) {
  const chests = {
    findRecord: jest.fn().mockResolvedValue(CHEST),
    lockRecord: jest.fn().mockResolvedValue(CHEST),
    findIdByAfterTopic: jest.fn().mockResolvedValue(existing),
    createChest: jest.fn().mockResolvedValue({ id: 'c1' }),
    applyChanges: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  const sections = { lockRecord: jest.fn().mockResolvedValue({ id: 's1', pathId: 'p1' }) };
  const topics = { lockRecord: jest.fn().mockResolvedValue({ id: 't1', parentId: topicSection }) };
  const fakes = fakeKit();
  const service = new ChestsService(
    chests as unknown as PathChestsRepository,
    sections as unknown as PathSectionsRepository,
    topics as unknown as TopicsRepository,
    fakes.kit,
  );
  return { service, chests, sections, topics, ...fakes };
}

describe('ChestsService', () => {
  it("yaratish: bo'lim qulfi, audit, versiya; javob — sandiq tuguni", async () => {
    const { service, chests, sections, topics, auditor, bumped } = setup();

    await expect(service.create('s1', REQUEST, ACTOR)).resolves.toEqual({
      id: 'c1',
      title: 'Sandiq',
      afterTopicId: 't1',
      reward: REWARD,
    });
    expect(sections.lockRecord).toHaveBeenCalledWith('s1');
    expect(topics.lockRecord).toHaveBeenCalledWith('t1');
    expect(chests.createChest).toHaveBeenCalledWith({ ...REQUEST, sectionId: 's1' });
    expect(auditor.record).toHaveBeenCalledWith(
      AuditAction.CONTENT_CREATED,
      { type: 'PATH_CHEST', id: 'c1' },
      ACTOR,
      { after: { title: 'Sandiq', parentId: 's1' } },
    );
    expect(bumped).toHaveBeenCalledWith(['p1']);
  });

  it("boshqa bo'lim mavzusi (yoki yo'q mavzu) — 400 afterTopicId", async () => {
    const { service, chests, topics } = setup({ topicSection: 's2' });

    await expect(service.create('s1', REQUEST, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'afterTopicId' }],
    });
    topics.lockRecord.mockResolvedValue(null);
    await expect(service.create('s1', REQUEST, ACTOR)).rejects.toMatchObject({
      details: [{ field: 'afterTopicId' }],
    });
    expect(chests.createChest).not.toHaveBeenCalled();
  });

  it('mavzudan keyin sandiq bor — 409 CHEST_EXISTS (oldindan va poygada)', async () => {
    const expected = {
      code: ErrorCode.CONFLICT,
      details: { reason: 'CHEST_EXISTS', chestId: 'c0' },
    };
    await expect(
      setup({ existing: 'c0' }).service.create('s1', REQUEST, ACTOR),
    ).rejects.toMatchObject(expected);

    const { service, chests } = setup();
    chests.createChest.mockRejectedValue(new UniqueViolationError('uq'));
    chests.findIdByAfterTopic.mockResolvedValueOnce(null).mockResolvedValueOnce('c0');
    await expect(service.create('s1', REQUEST, ACTOR)).rejects.toMatchObject(expected);
  });

  it("poygada mavzu o'chirildi (FK) — 400 afterTopicId (500 emas)", async () => {
    const { service, chests } = setup();
    chests.createChest.mockRejectedValue(new ForeignKeyViolationError('fk'));

    await expect(service.create('s1', REQUEST, ACTOR)).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'afterTopicId' }],
    });
    chests.applyChanges.mockRejectedValue(new ForeignKeyViolationError('fk'));
    await expect(service.update('c1', { afterTopicId: 't2' }, ACTOR)).rejects.toMatchObject({
      details: [{ field: 'afterTopicId' }],
    });
  });

  it("PATCH/DELETE: qulf tartibi bo'lim → sandiq; qulf paytida yo'q — 404", async () => {
    const { service, chests, sections } = setup();

    await service.update('c1', { title: 'Yangi' }, ACTOR);
    expect(sections.lockRecord).toHaveBeenCalledWith('s1');
    expect(chests.lockRecord).toHaveBeenCalledWith('c1');
    expect(sections.lockRecord.mock.invocationCallOrder[0]).toBeLessThan(
      chests.lockRecord.mock.invocationCallOrder[0] ?? 0,
    );

    chests.lockRecord.mockResolvedValue(null);
    await expect(service.remove('c1', ACTOR)).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(chests.deleteById).not.toHaveBeenCalled();
  });

  it("PATCH: mukofot qiymat bo'yicha taqqoslanadi (kalit tartibi muhim emas) — no-op", async () => {
    const { service, chests, bumped } = setup();
    const reordered = { coin: { max: 30, min: 10 }, xp: { max: 50, min: 50 } };

    await service.update('c1', { reward: reordered }, ACTOR);

    expect(chests.applyChanges).not.toHaveBeenCalled();
    expect(bumped).toHaveBeenCalledWith([]);
  });

  it("PATCH afterTopicId: yangi mavzu tekshiriladi; o'chirish — audit va versiya", async () => {
    const { service, chests, auditor, topics } = setup();

    await service.update('c1', { afterTopicId: 't2' }, ACTOR);
    expect(topics.lockRecord).toHaveBeenCalledWith('t2');
    expect(chests.applyChanges).toHaveBeenCalledWith('c1', { afterTopicId: 't2' });

    await service.remove('c1', ACTOR);
    expect(chests.deleteById).toHaveBeenCalledWith('c1');
    expect(auditor.record).toHaveBeenLastCalledWith(
      AuditAction.CONTENT_DELETED,
      { type: 'PATH_CHEST', id: 'c1' },
      ACTOR,
      { before: { title: 'Sandiq', parentId: 's1' } },
    );
  });

  it('min > max — sxema darajasida 400 (reward.xp.max)', () => {
    const result = createChestSchema.safeParse({
      ...REQUEST,
      afterTopicId: '00000000-0000-4000-8000-000000000001',
      reward: { xp: { min: 5, max: 1 }, coin: { min: 0, max: 0 } },
    });

    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual(['reward.xp.max']);
  });
});
