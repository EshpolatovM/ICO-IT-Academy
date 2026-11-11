import { GroupStatus } from '@lms/shared';

import { groupRecord } from '../testing/groups.fixtures.js';

import { diffGroupChanges, groupChangeSnapshots, newGroupSnapshot } from './group-changes.js';

const STARTS_AT = '2026-11-15';

describe('diffGroupChanges', () => {
  it("bir xil qiymatlar — bo'sh diff (no-op)", () => {
    const target = groupRecord();

    expect(
      diffGroupChanges(target, { name: target.name, status: target.status, startsAt: STARTS_AT }),
    ).toStrictEqual({});
    expect(diffGroupChanges(target, {})).toStrictEqual({});
  });

  it("nom o'zgarishi — faqat `name`", () => {
    expect(diffGroupChanges(groupRecord(), { name: 'FE-13' })).toStrictEqual({ name: 'FE-13' });
  });

  it("holat o'zgarishi — faqat `status`", () => {
    expect(diffGroupChanges(groupRecord(), { status: GroupStatus.ARCHIVED })).toStrictEqual({
      status: GroupStatus.ARCHIVED,
    });
  });

  it("yangi sana — UTC yarim tundagi `Date`; bir xil sana — o'zgarish emas", () => {
    const target = groupRecord();

    expect(diffGroupChanges(target, { startsAt: '2026-12-01' })).toStrictEqual({
      startsAt: new Date('2026-12-01T00:00:00.000Z'),
    });
    expect(diffGroupChanges(target, { startsAt: STARTS_AT })).toStrictEqual({});
  });

  it("`startsAt: null` — sanani olib tashlash; sanasiz guruhda — o'zgarish emas", () => {
    expect(diffGroupChanges(groupRecord(), { startsAt: null })).toStrictEqual({ startsAt: null });
    expect(diffGroupChanges(groupRecord({ startsAt: null }), { startsAt: null })).toStrictEqual({});
    expect(
      diffGroupChanges(groupRecord({ startsAt: null }), { startsAt: STARTS_AT }),
    ).toStrictEqual({ startsAt: new Date(`${STARTS_AT}T00:00:00.000Z`) });
  });

  it("bir nechta maydon — faqat o'zgarganlari", () => {
    const target = groupRecord();

    expect(
      diffGroupChanges(target, { name: 'Yangi', status: target.status, startsAt: null }),
    ).toStrictEqual({ name: 'Yangi', startsAt: null });
  });
});

describe('groupChangeSnapshots', () => {
  it("faqat o'zgargan maydonlar, sana `YYYY-MM-DD` ko'rinishida", () => {
    const target = groupRecord();

    expect(
      groupChangeSnapshots(target, { name: 'FE-13', startsAt: new Date('2026-12-01T00:00:00Z') }),
    ).toStrictEqual({
      before: { name: 'FE-12', startsAt: STARTS_AT },
      after: { name: 'FE-13', startsAt: '2026-12-01' },
    });
  });

  it('sanani olib tashlash — after.startsAt = null', () => {
    expect(groupChangeSnapshots(groupRecord(), { startsAt: null })).toStrictEqual({
      before: { startsAt: STARTS_AT },
      after: { startsAt: null },
    });
  });
});

describe('newGroupSnapshot', () => {
  it("nom, holat, sana, yo'l va mentor", () => {
    expect(
      newGroupSnapshot({
        name: 'FE-12',
        status: GroupStatus.ACTIVE,
        startsAt: null,
        pathId: 'p1',
        mentorId: null,
      }),
    ).toStrictEqual({
      name: 'FE-12',
      status: GroupStatus.ACTIVE,
      startsAt: null,
      pathId: 'p1',
      mentorId: null,
    });
  });
});
