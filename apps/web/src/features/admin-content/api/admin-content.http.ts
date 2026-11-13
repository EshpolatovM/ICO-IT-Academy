import { apiRequest } from '@/lib/api';

import { AdminContentEndpoint as Endpoint } from './admin-content.endpoints';

import type { AdminContentApi } from '../types/admin-content-api.types';
import type {
  AdminChestNode,
  AdminLesson,
  AdminPathDetail,
  AdminPathsResponse,
  AdminPathTree,
  AdminSectionNode,
  AdminTopicNode,
} from '../types/admin-content.types';

/** 204 — javob body'siz. */
function remove(path: string): Promise<void> {
  return apiRequest<undefined>(path, { method: 'DELETE' });
}

function reorder(path: string, body: Record<string, string[]>): Promise<void> {
  return apiRequest<undefined>(path, { method: 'PUT', body });
}

function post<T>(path: string, body?: object): Promise<T> {
  return apiRequest<T>(path, { method: 'POST', body });
}

function patch<T>(path: string, body: object): Promise<T> {
  return apiRequest<T>(path, { method: 'PATCH', body });
}

/** Haqiqiy backend (3.2) implementatsiyasi. Yozish — SA, A; mentor faqat ro'yxat va daraxt. */
export const adminContentHttpApi: AdminContentApi = {
  listPaths: () => apiRequest<AdminPathsResponse>(Endpoint.paths()),
  createPath: (body) => post<AdminPathDetail>(Endpoint.paths(), body),
  updatePath: (id, body) => patch<AdminPathDetail>(Endpoint.path(id), body),
  deletePath: (id) => remove(Endpoint.path(id)),
  publishPath: (id) => post<AdminPathDetail>(Endpoint.pathPublish(id)),
  getTree: (id) => apiRequest<AdminPathTree>(Endpoint.pathTree(id)),
  createSection: (pathId, body) => post<AdminSectionNode>(Endpoint.pathSections(pathId), body),
  updateSection: (id, body) => patch<AdminSectionNode>(Endpoint.section(id), body),
  deleteSection: (id) => remove(Endpoint.section(id)),
  reorderSections: (pathId, sectionIds) => reorder(Endpoint.sectionsOrder(pathId), { sectionIds }),
  createTopic: (sectionId, body) => post<AdminTopicNode>(Endpoint.sectionTopics(sectionId), body),
  updateTopic: (id, body) => patch<AdminTopicNode>(Endpoint.topic(id), body),
  deleteTopic: (id) => remove(Endpoint.topic(id)),
  reorderTopics: (sectionId, topicIds) => reorder(Endpoint.topicsOrder(sectionId), { topicIds }),
  createLesson: (topicId, body) => post<AdminLesson>(Endpoint.topicLessons(topicId), body),
  getLesson: (id) => apiRequest<AdminLesson>(Endpoint.lesson(id)),
  updateLesson: (id, body) => patch<AdminLesson>(Endpoint.lesson(id), body),
  deleteLesson: (id) => remove(Endpoint.lesson(id)),
  reorderLessons: (topicId, lessonIds) => reorder(Endpoint.lessonsOrder(topicId), { lessonIds }),
  createChest: (sectionId, body) => post<AdminChestNode>(Endpoint.sectionChests(sectionId), body),
  updateChest: (id, body) => patch<AdminChestNode>(Endpoint.chest(id), body),
  deleteChest: (id) => remove(Endpoint.chest(id)),
};
