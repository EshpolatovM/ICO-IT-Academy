import { ErrorCode } from '@lms/shared';

import { chainPath, snapshot, topic } from '../testing/learning.fixtures.js';

import { LessonAccessGuardService } from './lesson-access-guard.service.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';

import type { StudentPathState } from '../learning.types.js';
import type { StudentPathStateService } from './student-path-state.service.js';

const calculator = new PathUnlockCalculator();

function stateOf(): StudentPathState {
  const path = chainPath(topic('t1', 2), topic('t2'));
  const progress = snapshot({ t1: 'AVAILABLE' });
  return {
    studentId: 's1',
    path,
    chain: calculator.chain(path),
    progress,
    unlock: calculator.calculate(path, progress),
    enrollmentCompletedAt: null,
  };
}

function guardWith(state: StudentPathState | null) {
  const states = { load: jest.fn().mockResolvedValue(state) };
  return new LessonAccessGuardService(states as unknown as StudentPathStateService);
}

describe('LessonAccessGuardService', () => {
  it("yo'l yo'q — 404", async () => {
    await expect(guardWith(null).topic('s1', 't1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    await expect(guardWith(null).lesson('s1', 't1-l1')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
  });

  it("zanjirda yo'q (boshqa yo'l / nashr qilinmagan) — 404", async () => {
    const guard = guardWith(stateOf());

    await expect(guard.topic('s1', 'other')).rejects.toMatchObject({ status: 404 });
    await expect(guard.lesson('s1', 'other-l1')).rejects.toMatchObject({ status: 404 });
  });

  it('qulflangan mavzu yoki dars — 403 LOCKED', async () => {
    const guard = guardWith(stateOf());

    await expect(guard.topic('s1', 't2')).rejects.toMatchObject({
      code: ErrorCode.LOCKED,
      status: 403,
    });
    await expect(guard.lesson('s1', 't2-l1')).rejects.toMatchObject({ code: ErrorCode.LOCKED });
    await expect(guard.lesson('s1', 't1-l2')).rejects.toMatchObject({ code: ErrorCode.LOCKED });
  });

  it('ochiq — mavzu, dars, indeks va holatlar', async () => {
    const access = await guardWith(stateOf()).lesson('s1', 't1-l1');

    expect(access).toMatchObject({
      topic: { id: 't1' },
      lesson: { id: 't1-l1' },
      lessonIndex: 0,
      lessonStatus: 'AVAILABLE',
      topicStatus: 'AVAILABLE',
    });
  });
});
