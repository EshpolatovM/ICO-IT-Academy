import { ContentStatus } from '@lms/shared';

import { mockConflict } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

import { sectionsOfPath, toPathItem, toSectionNode } from './admin-content.mock-mappers';
import {
  applyOrder,
  applyPatch,
  hasProgress,
  hasProgressConflict,
  lessonIdsOfTopics,
  mockDb,
  newMockId,
  nextOrder,
  nowIso,
  removeSections,
  requireById,
  topicIdsOfSections,
} from './admin-content.mock-store';

import type { MockPath } from './admin-content.mock-data';
import type {
  CreatePathRequest,
  CreateSectionRequest,
  UpdatePathRequest,
  UpdateSectionRequest,
} from '../types/admin-content-api.types';
import type { AdminPathsResponse, AdminSectionNode } from '../types/admin-content.types';

/** Yo'l va bo'lim amallari (soxta API). */

function assertSlugFree(slug: string | undefined, exceptId: string | null): void {
  const taken = mockDb().paths.some((path) => path.slug === slug && path.id !== exceptId);
  if (slug !== undefined && taken) {
    throw mockConflict('Bu slug band', { field: 'slug' });
  }
}

function pathLessonIds(pathId: string): string[] {
  const sectionIds = sectionsOfPath(pathId).map(({ id }) => id);
  return lessonIdsOfTopics(topicIdsOfSections(sectionIds));
}

export function listPaths(): AdminPathsResponse {
  const items = [...mockDb().paths].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { items: items.map(toPathItem) };
}

export function createPath(body: CreatePathRequest): MockPath {
  assertSlugFree(body.slug, null);
  const now = nowIso();
  const path: MockPath = {
    id: newMockId('path'),
    title: body.title,
    slug: body.slug,
    description: body.description ?? null,
    status: ContentStatus.DRAFT,
    createdAt: now,
    updatedAt: now,
    groupsCount: 0,
  };
  mockDb().paths.push(path);
  return path;
}

export function updatePath(pathId: string, body: UpdatePathRequest): MockPath {
  const path = requireById(mockDb().paths, pathId);
  assertSlugFree(body.slug, pathId);
  applyPatch(path, body);
  path.updatedAt = nowIso();
  return path;
}

/** Nashr kaskad qilmaydi (Q-1); idempotent. */
export function publishPath(pathId: string): MockPath {
  const path = requireById(mockDb().paths, pathId);
  if (path.status !== ContentStatus.PUBLISHED) {
    path.status = ContentStatus.PUBLISHED;
    path.updatedAt = nowIso();
  }
  return path;
}

export function deletePath(pathId: string): void {
  const db = mockDb();
  const path = requireById(db.paths, pathId);
  if (path.groupsCount > 0 || hasProgress(pathLessonIds(pathId))) {
    throw mockConflict("Yo'l ishlatilmoqda", {
      reason: ContentConflictReason.PATH_IN_USE,
      groupsCount: path.groupsCount,
    });
  }
  removeSections(sectionsOfPath(pathId).map(({ id }) => id));
  db.paths = db.paths.filter((item) => item.id !== pathId);
}

export function createSection(pathId: string, body: CreateSectionRequest): AdminSectionNode {
  requireById(mockDb().paths, pathId);
  const section = {
    id: newMockId('section'),
    pathId,
    order: nextOrder(sectionsOfPath(pathId)),
    title: body.title,
    description: body.description ?? null,
    status: ContentStatus.DRAFT,
  };
  mockDb().sections.push(section);
  return toSectionNode(section);
}

export function updateSection(sectionId: string, body: UpdateSectionRequest): AdminSectionNode {
  const section = requireById(mockDb().sections, sectionId);
  applyPatch(section, body);
  return toSectionNode(section);
}

export function deleteSection(sectionId: string): void {
  requireById(mockDb().sections, sectionId);
  if (hasProgress(lessonIdsOfTopics(topicIdsOfSections([sectionId])))) {
    throw hasProgressConflict();
  }
  removeSections([sectionId]);
}

export function reorderSections(pathId: string, sectionIds: readonly string[]): void {
  requireById(mockDb().paths, pathId);
  applyOrder(sectionsOfPath(pathId), sectionIds, 'sectionIds');
}
