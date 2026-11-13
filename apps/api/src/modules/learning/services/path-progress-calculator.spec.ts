import { TopicStatus } from '@lms/shared';

import { chainPath, snapshot, topic } from '../testing/learning.fixtures.js';

import { PathProgressCalculator } from './path-progress-calculator.js';
import { PathUnlockCalculator } from './path-unlock-calculator.js';

const progress = new PathProgressCalculator();
const unlock = new PathUnlockCalculator();

describe('PathProgressCalculator', () => {
  it("mavzu: faqat ko'rinadigan darslar sanaladi (D-5 — yashirilgan dars hisobdan chiqadi)", () => {
    const visible = topic('t1', 3);
    visible.lessons.splice(2, 1);
    const counts = progress.topicLessons(
      visible,
      snapshot({}, { 't1-l1': 'COMPLETED', 't1-l3': 'COMPLETED' }),
    );

    expect(counts).toEqual({ lessons: 2, lessonsCompleted: 1 });
  });

  it("yo'l/bo'lim: COMPLETED mavzular / ko'rinadigan mavzular; maxraj 0 — 0", () => {
    const path = chainPath(topic('t1'), topic('t2'), topic('t3'), topic('t4'));
    const state = unlock.calculate(path, snapshot({ t1: 'COMPLETED' }));

    expect(progress.completedRatio(unlock.chain(path), state)).toBe(0.25);
    expect(progress.completedRatio([], state)).toBe(0);
  });

  it('S-B2: COMPLETED mavzuga yangi dars — mavzu yakunlangan hisoblanadi, lessonsCompleted < lessons', () => {
    const path = chainPath(topic('t1', 2));
    const progressRows = snapshot({ t1: TopicStatus.COMPLETED }, { 't1-l1': 'COMPLETED' });
    const state = unlock.calculate(path, progressRows);

    expect(progress.completedRatio(unlock.chain(path), state)).toBe(1);
    expect(progress.topicLessons(topic('t1', 2), progressRows)).toEqual({
      lessons: 2,
      lessonsCompleted: 1,
    });
    expect(state.lessons.get('t1-l2')).toBe('AVAILABLE');
  });
});
