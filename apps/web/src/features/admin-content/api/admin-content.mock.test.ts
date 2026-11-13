import { beforeEach, describe, expect, it } from 'vitest';

import { ContentStatus, ErrorCode } from '@lms/shared';

import { ContentConflictReason } from '../types/admin-content.types';

import { adminContentMockApi as api, resetAdminContentMock } from './admin-content.mock';

const REWARD = { xp: { min: 1, max: 2 }, coin: { min: 0, max: 0 } };

function conflict(reason: ContentConflictReason) {
  return { status: 409, code: ErrorCode.CONFLICT, details: { reason } };
}

describe('adminContentMockApi', () => {
  beforeEach(() => {
    resetAdminContentMock();
  });

  it("ro'yxat: sanoqlar bilan; yangi yo'l DRAFT va ro'yxat boshida", async () => {
    const initial = await api.listPaths();
    expect(initial.items.find((item) => item.id === 'path-frontend')).toMatchObject({
      sectionsCount: 2,
      topicsCount: 3,
    });
    const created = await api.createPath({ title: 'Go', slug: 'go' });
    expect(created).toMatchObject({ status: ContentStatus.DRAFT, description: null });
    expect((await api.listPaths()).items[0]?.id).toBe(created.id);
  });

  it("band slug — 409 CONFLICT details: { field: 'slug' } (B-1)", async () => {
    await expect(api.createPath({ title: 'X', slug: 'frontend' })).rejects.toMatchObject({
      status: 409,
      details: { field: 'slug' },
    });
    await expect(api.updatePath('path-python', { slug: 'frontend' })).rejects.toMatchObject({
      details: { field: 'slug' },
    });
  });

  it("guruh ishlatayotgan yo'l — 409 PATH_IN_USE (groupsCount bilan); bo'shi o'chadi", async () => {
    await expect(api.deletePath('path-frontend')).rejects.toMatchObject({
      ...conflict(ContentConflictReason.PATH_IN_USE),
      details: { reason: ContentConflictReason.PATH_IN_USE, groupsCount: 1 },
    });
    await api.deletePath('path-python');
    await expect(api.getTree('path-python')).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
  });

  it('publish kaskad qilmaydi (Q-1) va idempotent', async () => {
    await api.publishPath('path-python');
    const again = await api.publishPath('path-python');
    expect(again.status).toBe(ContentStatus.PUBLISHED);
    const section = await api.createSection('path-python', { title: 'Kirish' });
    expect(section.status).toBe(ContentStatus.DRAFT);
    await api.publishPath('path-frontend');
    const tree = await api.getTree('path-frontend');
    expect(tree.sections[1]?.status).toBe(ContentStatus.DRAFT);
  });

  it("tartiblash: to'liq permutatsiya → order 1..n; to'liq emas → 400 field", async () => {
    await api.createTopic('section-html', { title: 'Jadval' });
    const before = await api.getTree('path-frontend');
    const ids = before.sections[0]?.topics.map(({ id }) => id) ?? [];
    const reversed = [...ids].reverse();
    await api.reorderTopics('section-html', reversed);
    const after = await api.getTree('path-frontend');
    expect(after.sections[0]?.topics.map(({ id, order }) => [id, order])).toEqual(
      reversed.map((id, index) => [id, index + 1]),
    );
    await expect(api.reorderTopics('section-html', ids.slice(1))).rejects.toMatchObject({
      status: 400,
      code: ErrorCode.VALIDATION_ERROR,
      details: [{ field: 'topicIds' }],
    });
    await expect(
      api.reorderSections('path-frontend', ['section-css', 'section-css']),
    ).rejects.toMatchObject({
      details: [{ field: 'sectionIds' }],
    });
  });

  it("o'chirish: progress — HAS_PROGRESS, sandiq bog'langan mavzu — HAS_CHEST", async () => {
    await expect(api.deleteLesson('lesson-tags-intro')).rejects.toMatchObject(
      conflict(ContentConflictReason.HAS_PROGRESS),
    );
    await expect(api.deleteSection('section-html')).rejects.toMatchObject(
      conflict(ContentConflictReason.HAS_PROGRESS),
    );
    await expect(api.deleteTopic('topic-html-forms')).resolves.toBeUndefined();
    await api.createChest('section-css', {
      title: 'C',
      afterTopicId: 'topic-css-selectors',
      reward: REWARD,
    });
    await expect(api.deleteTopic('topic-css-selectors')).rejects.toMatchObject({
      details: { reason: ContentConflictReason.HAS_CHEST, chestId: 'chest-new-1' },
    });
  });

  it("bo'lim o'chsa — mavzulari, darslari va sandiqlari ham (kaskad)", async () => {
    await api.createChest('section-css', {
      title: 'C',
      afterTopicId: 'topic-css-selectors',
      reward: REWARD,
    });
    await api.deleteSection('section-css');
    await expect(api.getLesson('lesson-css-basics')).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    const tree = await api.getTree('path-frontend');
    expect(tree.sections.map(({ id }) => id)).toEqual(['section-html']);
  });

  it("sandiq: boshqa bo'lim mavzusi — 400 afterTopicId; ikkinchi sandiq — CHEST_EXISTS", async () => {
    await expect(
      api.createChest('section-html', {
        title: 'X',
        afterTopicId: 'topic-css-selectors',
        reward: REWARD,
      }),
    ).rejects.toMatchObject({
      status: 400,
      details: [{ field: 'afterTopicId' }],
    });
    await expect(
      api.createChest('section-html', {
        title: 'X',
        afterTopicId: 'topic-html-tags',
        reward: REWARD,
      }),
    ).rejects.toMatchObject(conflict(ContentConflictReason.CHEST_EXISTS));
    const moved = await api.updateChest('chest-html-1', { afterTopicId: 'topic-html-forms' });
    expect(moved.afterTopicId).toBe('topic-html-forms');
  });

  it("dars: yaratish oxiriga, PATCH (null — tozalash), yo'l va mavzu bilan", async () => {
    const lesson = await api.createLesson('topic-html-tags', { title: 'Uchinchi' });
    expect(lesson).toMatchObject({ order: 3, contentMd: '', status: ContentStatus.DRAFT });
    const updated = await api.updateLesson(lesson.id, {
      videoUrl: 'https://example.com/v',
      estMinutes: 7,
    });
    expect(updated).toMatchObject({
      videoUrl: 'https://example.com/v',
      estMinutes: 7,
      title: 'Uchinchi',
    });
    expect(updated.path).toEqual({ id: 'path-frontend', title: 'Frontend dasturchi' });
    const cleared = await api.updateLesson(lesson.id, { videoUrl: null });
    expect(cleared.videoUrl).toBeNull();
    const tree = await api.getTree('path-frontend');
    expect(tree.sections[0]?.topics[0]?.lessons[2]).toMatchObject({
      id: lesson.id,
      hasVideo: false,
    });
  });
});
