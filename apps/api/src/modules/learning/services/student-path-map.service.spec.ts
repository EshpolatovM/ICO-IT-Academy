import { chainPath, snapshot, topic } from '../testing/learning.fixtures.js';

import { PathProgressCalculator } from './path-progress-calculator.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';
import { StudentPathMapBuilder } from './student-path-map-builder.js';
import { StudentPathMapService } from './student-path-map.service.js';

import type { StudentPathCacheEnvelope, StudentPathState } from '../learning.types.js';
import type { ReviewGate } from './review-gate.js';
import type { StudentPathCache } from './student-path-cache.service.js';
import type { CurrentPathRef } from './student-path-resolver.service.js';
import type { StudentPathStateService } from './student-path-state.service.js';
import type { TopicCompletionService } from './topic-completion.service.js';

const REVIEW = { blocked: false, dueCount: 0 };
const calculator = new PathUnlockCalculator();
const builder = new StudentPathMapBuilder(new PathProgressCalculator());

function stateOf(): StudentPathState {
  const path = chainPath(topic('t1', 2), topic('t2'));
  const progress = snapshot({ t1: 'IN_PROGRESS' }, { 't1-l1': 'COMPLETED' });
  return {
    studentId: 's1',
    path,
    chain: calculator.chain(path),
    progress,
    unlock: calculator.calculate(path, progress),
    enrollmentCompletedAt: null,
  };
}

interface Options {
  ref?: CurrentPathRef | null;
  envelope?: StudentPathCacheEnvelope | null;
  generation?: string | null;
  needsReconcile?: boolean;
}

function setup(options: Options = {}) {
  const { ref = { pathId: 'p1', contentVersion: '2' }, envelope = null, generation = '' } = options;
  const states = {
    currentPath: jest.fn().mockResolvedValue(ref),
    load: jest.fn().mockResolvedValue(stateOf()),
    refresh: jest.fn().mockResolvedValue(stateOf()),
  };
  const cache = {
    read: jest.fn().mockResolvedValue(envelope),
    generation: jest.fn().mockResolvedValue(generation),
    store: jest.fn().mockResolvedValue(undefined),
  };
  const topicCompletion = {
    needsReconcile: jest.fn().mockReturnValue(options.needsReconcile ?? false),
    reconcile: jest.fn().mockResolvedValue(undefined),
  };
  const gate = { status: jest.fn().mockResolvedValue(REVIEW) };
  const service = new StudentPathMapService(
    states as unknown as StudentPathStateService,
    cache as unknown as StudentPathCache,
    topicCompletion as unknown as TopicCompletionService,
    gate as unknown as ReviewGate,
    builder,
  );
  return { service, states, cache, topicCompletion };
}

describe('StudentPathMapService', () => {
  it("faol yo'l yo'q — bo'sh xarita (S-D1)", async () => {
    const { service, states } = setup({ ref: null });

    await expect(service.get('s1')).resolves.toEqual({
      path: null,
      currentTopicId: null,
      reviewBlock: REVIEW,
      sections: [],
    });
    expect(states.load).not.toHaveBeenCalled();
  });

  it('DB dan hisoblanadi va keshga (gen bilan) yoziladi: progress, nodes, currentTopicId', async () => {
    const { service, cache } = setup();

    const map = await service.get('s1');
    expect(map).toMatchObject({
      path: { id: 'p1', progress: 0 },
      currentTopicId: 't1',
      sections: [
        {
          id: 's1',
          progress: 0,
          nodes: [
            { kind: 'TOPIC', id: 't1', status: 'IN_PROGRESS', lessons: 2, lessonsCompleted: 1 },
            { kind: 'TOPIC', id: 't2', status: 'LOCKED', lessons: 1, lessonsCompleted: 0 },
          ],
        },
      ],
    });
    expect(cache.store).toHaveBeenCalledWith('s1', { pathId: 'p1', contentVersion: '2', map }, '');
  });

  it("kesh hit — pathId va versiya mos bo'lsa, DB o'qilmaydi", async () => {
    const map = builder.build(stateOf(), REVIEW);
    const { service, states } = setup({ envelope: { pathId: 'p1', contentVersion: '2', map } });

    await expect(service.get('s1')).resolves.toEqual(map);
    expect(states.load).not.toHaveBeenCalled();
  });

  it.each([
    ["boshqa yo'l", { pathId: 'p2', contentVersion: '2' }],
    ['eski kontent versiyasi', { pathId: 'p1', contentVersion: '1' }],
  ])('kesh miss — %s', async (_name, stale) => {
    const map = builder.build(stateOf(), REVIEW);
    const { service, states } = setup({ envelope: { ...stale, map } });

    await service.get('s1');
    expect(states.load).toHaveBeenCalled();
  });

  it('Redis ishlamaydi (versiya yoki gen null) — DB dan, keshga yozilmaydi', async () => {
    const first = setup({ ref: { pathId: 'p1', contentVersion: null } });
    await first.service.get('s1');
    expect(first.cache.read).not.toHaveBeenCalled();
    expect(first.cache.store).not.toHaveBeenCalled();

    const second = setup({ generation: null });
    await second.service.get('s1');
    expect(second.cache.store).not.toHaveBeenCalled();
  });

  it("reconcile kerak — bajariladi va progress qayta o'qiladi", async () => {
    const { service, topicCompletion, states } = setup({ needsReconcile: true });

    await service.get('s1');
    expect(topicCompletion.reconcile).toHaveBeenCalled();
    expect(states.refresh).toHaveBeenCalled();
  });
});
