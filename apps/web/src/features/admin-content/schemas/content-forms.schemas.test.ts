import { describe, expect, it } from 'vitest';

import { ContentStatus } from '@lms/shared';

import { REWARD_RANGE_MESSAGE, VIDEO_URL_MESSAGE } from './content-fields.schemas';
import { chestFormSchema, lessonEditorFormSchema, pathFormSchema } from './content-forms.schemas';

const LESSON = {
  title: 'Dars',
  contentMd: '# Matn',
  videoUrl: '',
  estMinutes: '',
  status: ContentStatus.DRAFT,
};

function issues(result: {
  success: boolean;
  error?: { issues: { path: PropertyKey[]; message: string }[] };
}) {
  return (result.error?.issues ?? []).map(({ path, message }) => [path.join('.'), message]);
}

describe('admin kontent form sxemalari', () => {
  it("yo'l: slug formati; bo'sh tavsif → null", () => {
    expect(pathFormSchema.parse({ title: ' Go ', slug: 'go-lang', description: '' })).toEqual({
      title: 'Go',
      slug: 'go-lang',
      description: null,
    });
    expect(
      pathFormSchema.safeParse({ title: 'Go', slug: 'Go Lang', description: '' }).success,
    ).toBe(false);
  });

  it("dars: video faqat https (toSafeUrl), bo'sh — null; vaqt butun musbat son", () => {
    expect(lessonEditorFormSchema.parse(LESSON)).toMatchObject({
      videoUrl: null,
      estMinutes: null,
    });
    expect(
      lessonEditorFormSchema.parse({ ...LESSON, videoUrl: 'https://x.uz/v', estMinutes: '15' }),
    ).toMatchObject({
      videoUrl: 'https://x.uz/v',
      estMinutes: 15,
    });
    for (const videoUrl of ['http://x.uz/v', 'javascript:alert(1)', 'x.uz']) {
      expect(issues(lessonEditorFormSchema.safeParse({ ...LESSON, videoUrl }))).toEqual([
        ['videoUrl', VIDEO_URL_MESSAGE],
      ]);
    }
    expect(lessonEditorFormSchema.safeParse({ ...LESSON, estMinutes: '0' }).success).toBe(false);
    expect(lessonEditorFormSchema.safeParse({ ...LESSON, estMinutes: 'abc' }).success).toBe(false);
  });

  it('sandiq: mukofot butun ≥ 0, min ≤ max (xato max maydonida)', () => {
    const chest = {
      title: 'Sandiq',
      afterTopicId: 't1',
      reward: { xp: { min: '10', max: '20' }, coin: { min: '5', max: '5' } },
    };
    expect(chestFormSchema.parse(chest).reward).toEqual({
      xp: { min: 10, max: 20 },
      coin: { min: 5, max: 5 },
    });
    const inverted = { ...chest, reward: { ...chest.reward, xp: { min: '30', max: '20' } } };
    expect(issues(chestFormSchema.safeParse(inverted))).toEqual([
      ['reward.xp.max', REWARD_RANGE_MESSAGE],
    ]);
    const negative = { ...chest, reward: { ...chest.reward, coin: { min: '-1', max: '' } } };
    expect(chestFormSchema.safeParse(negative).success).toBe(false);
  });
});
