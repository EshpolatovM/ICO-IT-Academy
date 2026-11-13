import { mockConflict, mockNotFound, mockValidationError } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

import { initialMockContentDb } from './admin-content.mock-data';

import type { MockContentDb } from './admin-content.mock-data';

/** Xotiradagi soxta kontent bazasi va umumiy amallar (topish, tartib, id, xatolar). */

let db: MockContentDb = initialMockContentDb();
let sequence = 0;

export function mockDb(): MockContentDb {
  return db;
}

/** Testlar uchun: bazani boshlang'ich holatga qaytaradi. */
export function resetMockDb(): void {
  db = initialMockContentDb();
  sequence = 0;
}

export function newMockId(prefix: string): string {
  sequence += 1;
  return `${prefix}-new-${String(sequence)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Ro'yxatdan id bo'yicha topadi, yo'q bo'lsa — 404. */
export function requireById<T extends { id: string }>(items: readonly T[], id: string): T {
  const item = items.find((entry) => entry.id === id);
  if (item === undefined) {
    throw mockNotFound();
  }
  return item;
}

/** Yaratish — oxiriga: `max(order) + 1` (§4.5). */
export function nextOrder(items: readonly { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), 0) + 1;
}

export function byOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** PATCH: faqat berilgan (`undefined` bo'lmagan) maydonlar yoziladi. */
export function applyPatch<T extends object>(target: T, patch: Partial<T>): void {
  const defined = Object.entries(patch).filter(([, value]) => value !== undefined);
  Object.assign(target, Object.fromEntries(defined));
}

/**
 * `PUT …/order`: ro'yxat ota elementning barcha bolalarining aniq permutatsiyasi bo'lishi shart,
 * aks holda 400 (`field` — `sectionIds` / `topicIds` / `lessonIds`). Natija `order = 1…n`.
 */
export function applyOrder(
  children: readonly { id: string; order: number }[],
  ids: readonly string[],
  field: string,
): void {
  const unique = new Set(ids);
  const complete =
    unique.size === ids.length &&
    ids.length === children.length &&
    children.every((child) => unique.has(child.id));
  if (!complete) {
    throw mockValidationError(field, "Tartib ro'yxati to'liq emas yoki begona id bor");
  }
  children.forEach((child) => {
    child.order = ids.indexOf(child.id) + 1;
  });
}

export function hasProgress(lessonIds: readonly string[]): boolean {
  return lessonIds.some((id) => db.progressLessonIds.includes(id));
}

export function lessonIdsOfTopics(topicIds: readonly string[]): string[] {
  return db.lessons.filter((lesson) => topicIds.includes(lesson.topicId)).map(({ id }) => id);
}

export function topicIdsOfSections(sectionIds: readonly string[]): string[] {
  return db.topics.filter((topic) => sectionIds.includes(topic.sectionId)).map(({ id }) => id);
}

export function hasProgressConflict(): Error {
  return mockConflict("Studentlar progressi bor — o'chirish o'rniga arxivlang", {
    reason: ContentConflictReason.HAS_PROGRESS,
  });
}

/** Kaskad o'chirish: bo'limlar → mavzular → darslar va sandiqlar. */
export function removeSections(sectionIds: readonly string[]): void {
  removeTopics(topicIdsOfSections(sectionIds));
  db.chests = db.chests.filter((chest) => !sectionIds.includes(chest.sectionId));
  db.sections = db.sections.filter((section) => !sectionIds.includes(section.id));
}

export function removeTopics(topicIds: readonly string[]): void {
  db.lessons = db.lessons.filter((lesson) => !topicIds.includes(lesson.topicId));
  db.topics = db.topics.filter((topic) => !topicIds.includes(topic.id));
}
