import type { AdminPathTree } from '../types/admin-content.types';

/** Daraxt darajasi (`PUT …/order` endpointini tanlash uchun). */
export type TreeLevel = 'sections' | 'topics' | 'lessons';

/** `PUT …/order` so'rovi: ota id (yo'l, bo'lim yoki mavzu) va yangi to'liq tartib (Q-3). */
export interface ReorderRequest {
  level: TreeLevel;
  parentId: string;
  ids: string[];
}

export const MOVE_UP = -1;
export const MOVE_DOWN = 1;
export type MoveDelta = typeof MOVE_UP | typeof MOVE_DOWN;

/** Ro'yxatda `index` dagi elementni qo'shnisi bilan almashtiradi; chegaradan chiqsa — `null`. */
export function moveId(ids: readonly string[], index: number, delta: MoveDelta): string[] | null {
  const target = index + delta;
  const current = ids[index];
  const neighbour = ids[target];
  if (current === undefined || neighbour === undefined) {
    return null;
  }
  const next = [...ids];
  next[index] = neighbour;
  next[target] = current;
  return next;
}

/** TreeList `parentId` bo'yicha daraja va shu darajadagi bolalar id'lari. */
function siblingsOf(
  tree: AdminPathTree,
  parentId: string | null,
):
  | (Omit<ReorderRequest, 'ids'> & {
      siblings: string[];
    })
  | null {
  if (parentId === null) {
    return {
      level: 'sections',
      parentId: tree.path.id,
      siblings: tree.sections.map(({ id }) => id),
    };
  }
  const section = tree.sections.find(({ id }) => id === parentId);
  if (section !== undefined) {
    return { level: 'topics', parentId, siblings: section.topics.map(({ id }) => id) };
  }
  const topic = tree.sections.flatMap(({ topics }) => topics).find(({ id }) => id === parentId);
  return topic === undefined
    ? null
    : { level: 'lessons', parentId, siblings: topic.lessons.map(({ id }) => id) };
}

/** "Yuqoriga/Pastga" bosilganda yuboriladigan to'liq yangi tartib (yoki imkonsiz bo'lsa `null`). */
export function buildReorder(
  tree: AdminPathTree,
  parentId: string | null,
  index: number,
  delta: MoveDelta,
): ReorderRequest | null {
  const scope = siblingsOf(tree, parentId);
  if (scope === null) {
    return null;
  }
  const ids = moveId(scope.siblings, index, delta);
  return ids === null ? null : { level: scope.level, parentId: scope.parentId, ids };
}
