'use client';

import { adminContentApi as api } from '../api/admin-content.api';

import { useContentMutation } from './useContentMutation';

import type { ReorderRequest } from '../lib/tree-order';

function sendReorder({ level, parentId, ids }: ReorderRequest): Promise<void> {
  if (level === 'sections') {
    return api.reorderSections(parentId, ids);
  }
  return level === 'topics' ? api.reorderTopics(parentId, ids) : api.reorderLessons(parentId, ids);
}

/** `PUT …/sections|topics|lessons/order` — yangi to'liq tartib (Q-3). */
export function useReorder() {
  return useContentMutation(sendReorder);
}
