import { ContentStatus, ErrorCode } from '@lms/shared';

import { ACTOR, fakeKit } from '../testing/content.fixtures.js';

import { TopicsService } from './topics.service.js';

import type { TopicRecord } from '../content.types.js';
import type { PathTreeService } from './path-tree.service.js';
import type { PathChestsRepository } from '../repositories/path-chests.repository.js';
import type { TopicsRepository } from '../repositories/topics.repository.js';

const TOPIC: TopicRecord = {
  id: 't1',
  parentId: 's1',
  pathId: 'p1',
  title: 'HTML',
  description: null,
  icon: null,
  status: ContentStatus.DRAFT,
};

function setup(chestId: string | null = null) {
  const topics = {
    lockParent: jest.fn().mockResolvedValue('p1'),
    nextOrder: jest.fn().mockResolvedValue(1),
    createNode: jest.fn().mockResolvedValue({ id: 't1' }),
    findRecord: jest.fn().mockResolvedValue(TOPIC),
    lockRecord: jest.fn().mockResolvedValue(TOPIC),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  const chests = { findIdByAfterTopic: jest.fn().mockResolvedValue(chestId) };
  const tree = { topic: jest.fn().mockResolvedValue({ id: 't1' }) };
  const fakes = fakeKit();
  const service = new TopicsService(
    topics as unknown as TopicsRepository,
    fakes.kit,
    tree as unknown as PathTreeService,
    chests as unknown as PathChestsRepository,
  );
  return { service, topics, ...fakes };
}

describe('TopicsService', () => {
  it('yaratish: ixtiyoriy maydonlar null, javob — mavzu tuguni', async () => {
    const { service, topics } = setup();

    await expect(service.create('s1', { title: 'HTML', icon: 'html' }, ACTOR)).resolves.toEqual({
      id: 't1',
    });
    expect(topics.createNode).toHaveBeenCalledWith({
      parentId: 's1',
      order: 1,
      fields: { title: 'HTML', description: null, icon: 'html' },
    });
  });

  it("sandiq bog'langan — 409 HAS_CHEST (chestId bilan), o'chirilmaydi", async () => {
    const { service, topics } = setup('c1');

    await expect(service.remove('t1', ACTOR)).rejects.toMatchObject({
      code: ErrorCode.CONFLICT,
      details: { reason: 'HAS_CHEST', chestId: 'c1' },
    });
    expect(topics.deleteById).not.toHaveBeenCalled();
  });

  it("progress tekshiruvi TOPIC darajasida; sandiq yo'q — o'chiriladi", async () => {
    const { service, topics, progress } = setup();

    await service.remove('t1', ACTOR);

    expect(progress.hasProgress).toHaveBeenCalledWith('TOPIC', 't1');
    expect(topics.deleteById).toHaveBeenCalledWith('t1');
  });
});
