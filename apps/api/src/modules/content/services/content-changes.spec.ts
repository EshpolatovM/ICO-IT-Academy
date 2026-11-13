import { diffChanges, isEmptyDiff, sameReward } from './content-changes.js';

const REWARD = { xp: { min: 1, max: 2 }, coin: { min: 3, max: 4 } };

describe('content-changes', () => {
  it("diff: berilgan va farq qiladigan maydonlar; null — o'zgarish (tozalash)", () => {
    const current = { title: 'A', description: 'd' as string | null, icon: null as string | null };

    expect(diffChanges(current, { title: 'A', description: null, icon: undefined })).toEqual({
      description: null,
    });
    expect(isEmptyDiff(diffChanges(current, { title: 'A' }))).toBe(true);
  });

  it("sameReward — qiymat bo'yicha", () => {
    expect(sameReward(REWARD, { coin: { max: 4, min: 3 }, xp: { max: 2, min: 1 } })).toBe(true);
    expect(sameReward(REWARD, { ...REWARD, coin: { min: 3, max: 5 } })).toBe(false);
  });
});
