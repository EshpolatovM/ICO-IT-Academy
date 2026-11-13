import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType } from '@lms/shared';

import { ConcurrentModificationError } from '../../../common/exceptions/concurrent-modification.error.js';
import { ContentField } from '../content.constants.js';
import { concurrentChangeException, invalidFieldException, orNotFound } from '../content.errors.js';
import { LessonsRepository } from '../repositories/lessons.repository.js';
import { PathSectionsRepository } from '../repositories/path-sections.repository.js';
import { TopicsRepository } from '../repositories/topics.repository.js';

import { ContentKit } from './content-kit.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { OrderedChildren } from '../repositories/ordered-content.repository.js';

/** Qayta tartiblanadigan daraja: ota ichidagi bolalar. */
export const OrderLevel = {
  SECTIONS: 'SECTIONS',
  TOPICS: 'TOPICS',
  LESSONS: 'LESSONS',
} as const;
export type OrderLevel = (typeof OrderLevel)[keyof typeof OrderLevel];

interface OrderTarget {
  children: OrderedChildren;
  /** Xato `details[].field` i — so'rov maydoni. */
  field: string;
  /** Audit obyekti — ota (`CONTENT_REORDERED`). */
  parentType: AuditEntityType;
}

function sameSequence(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Uchala daraja uchun umumiy qayta tartiblash (TL Q-3, 3.2 §4 p.5): ro'yxat otaning BARCHA
 * bolalarining (barcha holatlar) aniq permutatsiyasi bo'lishi shart, natija — `order = 1…n`, bitta
 * statement, ota qulfi ostida. Tartib o'zgarmagan bo'lsa — yozuv, audit va versiya bump yo'q.
 */
@Injectable()
export class ContentOrderService {
  private readonly targets: Readonly<Record<OrderLevel, OrderTarget>>;

  constructor(
    sections: PathSectionsRepository,
    topics: TopicsRepository,
    lessons: LessonsRepository,
    private readonly kit: ContentKit,
  ) {
    this.targets = {
      [OrderLevel.SECTIONS]: {
        children: sections,
        field: ContentField.SECTION_IDS,
        parentType: AuditEntityType.LEARNING_PATH,
      },
      [OrderLevel.TOPICS]: {
        children: topics,
        field: ContentField.TOPIC_IDS,
        parentType: AuditEntityType.PATH_SECTION,
      },
      [OrderLevel.LESSONS]: {
        children: lessons,
        field: ContentField.LESSON_IDS,
        parentType: AuditEntityType.TOPIC,
      },
    };
  }

  async reorder(
    level: OrderLevel,
    parentId: string,
    ids: readonly string[],
    actor: ActorContext,
  ): Promise<void> {
    const { children, field, parentType } = this.targets[level];
    await this.kit.transaction.commit(async () => {
      const pathId = orNotFound(await children.lockParent(parentId));
      const current = await children.childIds(parentId);
      assertPermutation(field, current, ids);
      if (sameSequence(current, ids)) {
        return { result: undefined, changedPathIds: [] };
      }
      await this.applyOrder(children, parentId, ids);
      await this.kit.auditor.record(
        AuditAction.CONTENT_REORDERED,
        { type: parentType, id: parentId },
        actor,
        { before: { ids: current }, after: { ids: [...ids] } },
      );
      return { result: undefined, changedPathIds: [pathId] };
    });
  }

  /** Poygada yangilangan qatorlar soni mos kelmasa — 409 `CONFLICT` (500 emas). */
  private async applyOrder(
    children: OrderedChildren,
    parentId: string,
    ids: readonly string[],
  ): Promise<void> {
    try {
      await children.reorder(parentId, ids);
    } catch (error) {
      throw error instanceof ConcurrentModificationError ? concurrentChangeException() : error;
    }
  }
}

/** Yetishmagan yoki begona id bo'lsa — 400 (`message` da ikkalasining soni). */
function assertPermutation(
  field: string,
  current: readonly string[],
  requested: readonly string[],
): void {
  const requestedSet = new Set(requested);
  const currentSet = new Set(current);
  const missing = current.filter((id) => !requestedSet.has(id)).length;
  const extra = requested.filter((id) => !currentSet.has(id)).length;
  if (missing > 0 || extra > 0) {
    throw invalidFieldException(
      field,
      `Ro'yxat barcha elementlarni aynan bir martadan o'z ichiga olishi kerak: ` +
        `${String(missing)} ta yetishmaydi, ${String(extra)} ta begona.`,
    );
  }
}
