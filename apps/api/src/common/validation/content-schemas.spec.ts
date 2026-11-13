import {
  ContentStatus,
  createLessonSchema,
  createPathSchema,
  isContentVisible,
  publishPathSchema,
  setTopicSkillsSchema,
  updateLessonSchema,
  updateTopicSchema,
} from '@lms/shared';

/** `@lms/shared` kontent sxemalari va `isContentVisible` (3.2 §2.2, §2.5). */
describe('@lms/shared kontent', () => {
  it("isContentVisible: hammasi PUBLISHED — true; DRAFT/ARCHIVED bo'lsa yoki bo'sh — false", () => {
    const { PUBLISHED, DRAFT, ARCHIVED } = ContentStatus;

    expect(isContentVisible([PUBLISHED, PUBLISHED, PUBLISHED, PUBLISHED])).toBe(true);
    expect(isContentVisible([PUBLISHED, DRAFT, PUBLISHED])).toBe(false);
    expect(isContentVisible([PUBLISHED, ARCHIVED])).toBe(false);
    expect(isContentVisible([])).toBe(false);
  });

  it.each(['frontend', 'frontend-asoslari', 'js2'])('slug mos: %s', (slug) => {
    expect(createPathSchema.safeParse({ title: 'T', slug }).success).toBe(true);
  });

  it.each(['Frontend', 'front_end', '-a', 'a--b', 'a-', ''])('slug mos emas: %j', (slug) => {
    expect(createPathSchema.safeParse({ title: 'T', slug }).success).toBe(false);
  });

  it.each(['http://x.uz/v', 'javascript:alert(1)', 'ftp://x.uz', 'youtu.be/x'])(
    'videoUrl faqat https: — %s rad etiladi',
    (videoUrl) => {
      expect(createLessonSchema.safeParse({ title: 'D', videoUrl }).success).toBe(false);
    },
  );

  it('videoUrl https — qabul; PATCH da null — tozalash', () => {
    expect(
      createLessonSchema.safeParse({ title: 'D', videoUrl: 'https://youtu.be/x' }).success,
    ).toBe(true);
    expect(updateLessonSchema.parse({ videoUrl: null, estMinutes: null })).toEqual({
      videoUrl: null,
      estMinutes: null,
    });
  });

  it("PATCH: noma'lum maydon (sectionId — ko'chirish yo'q) va bo'sh body — 400", () => {
    expect(updateTopicSchema.safeParse({ sectionId: crypto.randomUUID() }).success).toBe(false);
    expect(updateTopicSchema.safeParse({}).success).toBe(false);
  });

  it("publish: body yo'q yoki {} — cascade false; noma'lum maydon — 400", () => {
    expect(publishPathSchema.parse(undefined)).toEqual({ cascade: false });
    expect(publishPathSchema.parse({})).toEqual({ cascade: false });
    expect(publishPathSchema.parse({ cascade: true })).toEqual({ cascade: true });
    expect(publishPathSchema.safeParse({ foo: 1 }).success).toBe(false);
  });

  it("mavzu ko'nikmalari: bo'sh ro'yxat — ruxsat, takror — 400", () => {
    const id = crypto.randomUUID();

    expect(setTopicSkillsSchema.safeParse({ skillIds: [] }).success).toBe(true);
    expect(setTopicSkillsSchema.safeParse({ skillIds: [id, id] }).success).toBe(false);
  });
});
