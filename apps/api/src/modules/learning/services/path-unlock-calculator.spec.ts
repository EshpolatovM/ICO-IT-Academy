import { ChestStatus, LessonStatus, TopicStatus } from '@lms/shared';

import { chainPath, pathOf, section, snapshot, topic } from '../testing/learning.fixtures.js';

import { PathUnlockCalculator, resolveChain } from './path-unlock-calculator.js';

const { LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED } = TopicStatus;
const calculator = new PathUnlockCalculator();

interface TopicCase {
  name: string;
  chain: string[];
  rows: Record<string, 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED'>;
  expected: string[];
  current: string | null;
}

/** 3.3 §4.3 / §9.1 — mavzu holatlari va `currentTopicId` (R Q-4). */
const TOPIC_CASES: TopicCase[] = [
  {
    name: 'yangi student (qatorsiz) — 1-mavzu AVAILABLE, qolganlari LOCKED',
    chain: ['t1', 't2', 't3'],
    rows: {},
    expected: [AVAILABLE, LOCKED, LOCKED],
    current: 't1',
  },
  {
    name: 'enrollment: 1-mavzu AVAILABLE qatori',
    chain: ['t1', 't2', 't3'],
    rows: { t1: AVAILABLE },
    expected: [AVAILABLE, LOCKED, LOCKED],
    current: 't1',
  },
  {
    name: 'oldingisi COMPLETED — keyingisi AVAILABLE',
    chain: ['t1', 't2', 't3'],
    rows: { t1: COMPLETED },
    expected: [COMPLETED, AVAILABLE, LOCKED],
    current: 't2',
  },
  {
    name: "S-35: o'rtaga qo'shilgan mavzu (keyinroq IN_PROGRESS bor) — AVAILABLE, joriy — IN_PROGRESS dagisi",
    chain: ['t1', 'tx', 't2', 't3'],
    rows: { t1: IN_PROGRESS, t2: IN_PROGRESS },
    expected: [IN_PROGRESS, AVAILABLE, IN_PROGRESS, LOCKED],
    current: 't2',
  },
  {
    name: "S-35: o'rtaga qo'shilgan mavzu (keyinroq COMPLETED bor) — AVAILABLE",
    chain: ['t1', 'tx', 't2', 't3'],
    rows: { t1: IN_PROGRESS, t2: COMPLETED },
    expected: [IN_PROGRESS, AVAILABLE, COMPLETED, AVAILABLE],
    current: 't3',
  },
  {
    name: 'hammasi COMPLETED — currentTopicId null',
    chain: ['t1', 't2'],
    rows: { t1: COMPLETED, t2: COMPLETED },
    expected: [COMPLETED, COMPLETED],
    current: null,
  },
  {
    name: "t1 (IN_PROGRESS) oldiga t0 qo'shildi — t0 AVAILABLE, joriy t1 (qulflanmaydi)",
    chain: ['t0', 't1', 't2'],
    rows: { t1: IN_PROGRESS },
    expected: [AVAILABLE, IN_PROGRESS, LOCKED],
    current: 't1',
  },
  {
    name: "t1 (faqat AVAILABLE qatori) oldiga t0 qo'shildi — t0 AVAILABLE, joriy t1",
    chain: ['t0', 't1', 't2'],
    rows: { t1: AVAILABLE },
    expected: [AVAILABLE, AVAILABLE, LOCKED],
    current: 't1',
  },
  {
    name: '🔴-1: keyingi mavzuda faqat AVAILABLE qatori — oraliq mavzu LOCKED',
    chain: ['t1', 'tx', 't3'],
    rows: { t1: IN_PROGRESS, t3: AVAILABLE },
    expected: [IN_PROGRESS, LOCKED, AVAILABLE],
    current: 't3',
  },
  {
    name: "🔴-1: faqat AVAILABLE qatorli t1 oxiriga ko'chirildi — t2 AVAILABLE, t3…t4 LOCKED, joriy t1",
    chain: ['t2', 't3', 't4', 't1'],
    rows: { t1: AVAILABLE },
    expected: [AVAILABLE, LOCKED, LOCKED, AVAILABLE],
    current: 't1',
  },
  {
    name: "bo'sh zanjir — currentTopicId null",
    chain: [],
    rows: {},
    expected: [],
    current: null,
  },
];

describe('PathUnlockCalculator', () => {
  it.each(TOPIC_CASES)('$name', ({ chain, rows, expected, current }) => {
    const path = chainPath(...chain.map((id) => topic(id)));
    const state = calculator.calculate(path, snapshot(rows));

    expect(chain.map((id) => state.topics.get(id))).toEqual(expected);
    expect(state.currentTopicId).toBe(current);
  });

  it("zanjir bo'limlar bo'ylab davom etadi (1-bo'lim tugadi — 2-bo'lim 1-mavzusi ochiq)", () => {
    const path = pathOf(section('s1', [topic('t1')]), section('s2', [topic('t2', 1, 's2')]));
    const state = calculator.calculate(path, snapshot({ t1: COMPLETED }));

    expect(state.topics.get('t2')).toBe(AVAILABLE);
  });

  it("darssiz mavzu zanjirga kirmaydi (zanjir to'xtab qolmaydi)", () => {
    const path = chainPath(topic('t1'), topic('empty', 0), topic('t2'));

    expect(calculator.chain(path).map((item) => item.id)).toEqual(['t1', 't2']);
    expect(calculator.calculate(path, snapshot({ t1: COMPLETED })).topics.get('t2')).toBe(
      AVAILABLE,
    );
  });

  describe('darslar', () => {
    it('ketma-ket: 1-dars AVAILABLE, keyingilari LOCKED; oldingisi COMPLETED — ochiladi', () => {
      const path = chainPath(topic('t1', 3));

      const fresh = calculator.calculate(path, snapshot());
      expect(['t1-l1', 't1-l2', 't1-l3'].map((id) => fresh.lessons.get(id))).toEqual([
        AVAILABLE,
        LOCKED,
        LOCKED,
      ]);
      const progressed = calculator.calculate(
        path,
        snapshot({ t1: IN_PROGRESS }, { 't1-l1': COMPLETED }),
      );
      expect(['t1-l1', 't1-l2', 't1-l3'].map((id) => progressed.lessons.get(id))).toEqual([
        COMPLETED,
        AVAILABLE,
        LOCKED,
      ]);
    });

    it('🔴-1 darslar uchun: boshlangan (yakunlanmagan) dars keyingisini ochmaydi', () => {
      const path = chainPath(topic('t1', 3));
      const state = calculator.calculate(
        path,
        snapshot({ t1: IN_PROGRESS }, { 't1-l1': IN_PROGRESS }),
      );

      expect(state.lessons.get('t1-l2')).toBe(LOCKED);
    });

    it("S-35 darslar: o'rtaga qo'shilgan dars (keyinroq progress bor) — AVAILABLE", () => {
      const path = chainPath(topic('t1', 3));
      const state = calculator.calculate(
        path,
        snapshot({ t1: IN_PROGRESS }, { 't1-l1': IN_PROGRESS, 't1-l3': IN_PROGRESS }),
      );

      expect(state.lessons.get('t1-l2')).toBe(AVAILABLE);
    });

    it("yashirilgan oldingi dars hisobga olinmaydi (uning qatori bo'lsa ham)", () => {
      const visible = topic('t1', 3);
      visible.lessons.splice(1, 1);
      const state = calculator.calculate(
        chainPath(visible),
        snapshot({ t1: IN_PROGRESS }, { 't1-l1': COMPLETED, 't1-l2': IN_PROGRESS }),
      );

      expect(state.lessons.get('t1-l3')).toBe(AVAILABLE);
      expect(state.lessons.has('t1-l2')).toBe(false);
    });

    it('qulflangan mavzu darslari — hammasi LOCKED', () => {
      const state = calculator.calculate(chainPath(topic('t1'), topic('t2', 2)), snapshot());

      expect([state.lessons.get('t2-l1'), state.lessons.get('t2-l2')]).toEqual([
        LessonStatus.LOCKED,
        LessonStatus.LOCKED,
      ]);
    });
  });

  describe('sandiqlar', () => {
    const chest = { id: 'c1', title: 'Sandiq', afterTopicId: 't1' };

    it('after_topic COMPLETED — READY, aks holda LOCKED', () => {
      const path = pathOf(section('s1', [topic('t1'), topic('t2')], [chest]));

      expect(calculator.calculate(path, snapshot()).chests.get('c1')).toBe(ChestStatus.LOCKED);
      expect(calculator.calculate(path, snapshot({ t1: COMPLETED })).chests.get('c1')).toBe(
        ChestStatus.READY,
      );
    });

    it("after_topic zanjirda yo'q — sandiq ko'rinmaydi", () => {
      const path = pathOf(section('s1', [topic('t2')], [chest]));

      expect(calculator.calculate(path, snapshot()).chests.has('c1')).toBe(false);
    });
  });

  it('resolveChain: yozilgan holat hech qachon pasaymaydi', () => {
    expect(resolveChain([undefined, COMPLETED, undefined])).toEqual([
      AVAILABLE,
      COMPLETED,
      AVAILABLE,
    ]);
    expect(resolveChain([undefined, undefined, AVAILABLE])).toEqual([AVAILABLE, LOCKED, AVAILABLE]);
  });
});
