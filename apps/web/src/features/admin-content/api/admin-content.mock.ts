import { mockRespond as respond } from '@/lib/api';

import * as chests from './admin-content.mock-chests';
import { toTree } from './admin-content.mock-mappers';
import * as paths from './admin-content.mock-paths';
import { mockDb, requireById, resetMockDb } from './admin-content.mock-store';
import * as topics from './admin-content.mock-topics';

import type { AdminContentApi } from '../types/admin-content-api.types';

/*
 * Soxta admin kontent API (3.2 backend tayyor bo'lguncha): xotirada CRUD, tartiblash, nashr va
 * kontraktdagi xatolar (404, 400 maydon, 409 `CONFLICT` `details.field` / `details.reason`).
 */

/** Testlar uchun: bazani boshlang'ich holatga qaytaradi. */
export function resetAdminContentMock(): void {
  resetMockDb();
}

export const adminContentMockApi: AdminContentApi = {
  listPaths: () => respond(() => paths.listPaths()),
  createPath: (body) => respond(() => paths.createPath(body)),
  updatePath: (id, body) => respond(() => paths.updatePath(id, body)),
  deletePath: (id) =>
    respond(() => {
      paths.deletePath(id);
    }),
  publishPath: (id) => respond(() => paths.publishPath(id)),
  getTree: (id) => respond(() => toTree(requireById(mockDb().paths, id))),
  createSection: (pathId, body) => respond(() => paths.createSection(pathId, body)),
  updateSection: (id, body) => respond(() => paths.updateSection(id, body)),
  deleteSection: (id) =>
    respond(() => {
      paths.deleteSection(id);
    }),
  reorderSections: (pathId, ids) =>
    respond(() => {
      paths.reorderSections(pathId, ids);
    }),
  createTopic: (sectionId, body) => respond(() => topics.createTopic(sectionId, body)),
  updateTopic: (id, body) => respond(() => topics.updateTopic(id, body)),
  deleteTopic: (id) =>
    respond(() => {
      topics.deleteTopic(id);
    }),
  reorderTopics: (sectionId, ids) =>
    respond(() => {
      topics.reorderTopics(sectionId, ids);
    }),
  createLesson: (topicId, body) => respond(() => topics.createLesson(topicId, body)),
  getLesson: (id) => respond(() => topics.getLesson(id)),
  updateLesson: (id, body) => respond(() => topics.updateLesson(id, body)),
  deleteLesson: (id) =>
    respond(() => {
      topics.deleteLesson(id);
    }),
  reorderLessons: (topicId, ids) =>
    respond(() => {
      topics.reorderLessons(topicId, ids);
    }),
  createChest: (sectionId, body) => respond(() => chests.createChest(sectionId, body)),
  updateChest: (id, body) => respond(() => chests.updateChest(id, body)),
  deleteChest: (id) =>
    respond(() => {
      chests.deleteChest(id);
    }),
};
