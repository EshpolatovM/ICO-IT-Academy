import { describe, expect, it } from 'vitest';

import { buildReorder, moveId, MOVE_DOWN, MOVE_UP } from './tree-order';

import type { AdminPathTree } from '../types/admin-content.types';

function tree(): AdminPathTree {
  const topic = (id: string, lessons: string[]) => ({
    id,
    lessons: lessons.map((lessonId) => ({ id: lessonId })),
  });
  return {
    path: { id: 'p1' },
    sections: [
      { id: 's1', topics: [topic('t1', ['l1', 'l2', 'l3']), topic('t2', [])] },
      { id: 's2', topics: [] },
    ],
  } as unknown as AdminPathTree;
}

describe('tree-order', () => {
  it("moveId — qo'shni bilan almashtiradi, chegarada null", () => {
    expect(moveId(['a', 'b', 'c'], 1, MOVE_UP)).toEqual(['b', 'a', 'c']);
    expect(moveId(['a', 'b', 'c'], 1, MOVE_DOWN)).toEqual(['a', 'c', 'b']);
    expect(moveId(['a', 'b'], 0, MOVE_UP)).toBeNull();
    expect(moveId(['a', 'b'], 1, MOVE_DOWN)).toBeNull();
  });

  it("buildReorder — daraja va ota id (bo'lim: yo'l id'si) bilan to'liq tartib", () => {
    expect(buildReorder(tree(), null, 1, MOVE_UP)).toEqual({
      level: 'sections',
      parentId: 'p1',
      ids: ['s2', 's1'],
    });
    expect(buildReorder(tree(), 's1', 0, MOVE_DOWN)).toEqual({
      level: 'topics',
      parentId: 's1',
      ids: ['t2', 't1'],
    });
    expect(buildReorder(tree(), 't1', 2, MOVE_UP)).toEqual({
      level: 'lessons',
      parentId: 't1',
      ids: ['l1', 'l3', 'l2'],
    });
  });

  it("noma'lum ota yoki chegaradan chiqish — null", () => {
    expect(buildReorder(tree(), 'nope', 0, MOVE_DOWN)).toBeNull();
    expect(buildReorder(tree(), 't1', 2, MOVE_DOWN)).toBeNull();
  });
});
