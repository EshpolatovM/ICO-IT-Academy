import { mockConflict, mockValidationError } from '@/lib/api';

import { ContentConflictReason } from '../types/admin-content.types';

import { applyPatch, mockDb, newMockId, requireById } from './admin-content.mock-store';

import type { MockChest } from './admin-content.mock-data';
import type { CreateChestRequest, UpdateChestRequest } from '../types/admin-content-api.types';
import type { AdminChestNode } from '../types/admin-content.types';

/** Sandiq amallari (soxta API): `afterTopic ∈ section`, bitta mavzudan keyin bitta sandiq. */

function toChestNode({ sectionId: _sectionId, ...chest }: MockChest): AdminChestNode {
  return chest;
}

function assertAfterTopic(sectionId: string, afterTopicId: string, chestId: string | null): void {
  const db = mockDb();
  const topic = db.topics.find((item) => item.id === afterTopicId);
  if (topic?.sectionId !== sectionId) {
    throw mockValidationError('afterTopicId', "Mavzu shu bo'limga tegishli emas");
  }
  const taken = db.chests.some((item) => item.afterTopicId === afterTopicId && item.id !== chestId);
  if (taken) {
    throw mockConflict('Bu mavzudan keyin sandiq allaqachon bor', {
      reason: ContentConflictReason.CHEST_EXISTS,
    });
  }
}

export function createChest(sectionId: string, body: CreateChestRequest): AdminChestNode {
  requireById(mockDb().sections, sectionId);
  assertAfterTopic(sectionId, body.afterTopicId, null);
  const chest: MockChest = { id: newMockId('chest'), sectionId, ...body };
  mockDb().chests.push(chest);
  return toChestNode(chest);
}

export function updateChest(chestId: string, body: UpdateChestRequest): AdminChestNode {
  const chest = requireById(mockDb().chests, chestId);
  if (body.afterTopicId !== undefined) {
    assertAfterTopic(chest.sectionId, body.afterTopicId, chestId);
  }
  applyPatch(chest, body);
  return toChestNode(chest);
}

export function deleteChest(chestId: string): void {
  requireById(mockDb().chests, chestId);
  const db = mockDb();
  db.chests = db.chests.filter((chest) => chest.id !== chestId);
}
