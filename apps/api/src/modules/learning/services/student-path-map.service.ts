import { Injectable } from '@nestjs/common';

import type { ReviewBlock, StudentPathMap } from '@lms/shared';

import { ReviewGate } from './review-gate.js';
import { StudentPathCache } from './student-path-cache.service.js';
import { emptyPathMap, StudentPathMapBuilder } from './student-path-map-builder.js';
import { StudentPathStateService } from './student-path-state.service.js';
import { TopicCompletionService } from './topic-completion.service.js';

import type { CurrentPathRef } from './student-path-resolver.service.js';

/**
 * `GET /student/path` (3.3 §2.2, §6): joriy yo'l (har doim DB) → kesh (`pathId` va kontent versiyasi
 * mos bo'lsa hit) → holat (lazy enrollment bilan) → zarur bo'lsa reconcile (§4.8) → xarita → kesh
 * (`gen` o'zgarmagan bo'lsagina). `reviewBlock` keshlanmaydi — har safar `ReviewGate` dan.
 */
@Injectable()
export class StudentPathMapService {
  constructor(
    private readonly states: StudentPathStateService,
    private readonly cache: StudentPathCache,
    private readonly topicCompletion: TopicCompletionService,
    private readonly gate: ReviewGate,
    private readonly builder: StudentPathMapBuilder,
  ) {}

  async get(studentId: string): Promise<StudentPathMap> {
    const reviewBlock = await this.gate.status(studentId);
    const ref = await this.states.currentPath(studentId);
    if (ref === null) {
      return emptyPathMap(reviewBlock);
    }
    const cached = await this.readCached(studentId, ref);
    if (cached !== null) {
      return { ...cached, reviewBlock };
    }
    const generation = await this.cache.generation(studentId);
    const map = await this.compute(studentId, ref, reviewBlock);
    if (map === null) {
      return emptyPathMap(reviewBlock);
    }
    if (generation !== null && ref.contentVersion !== null) {
      const envelope = { pathId: ref.pathId, contentVersion: ref.contentVersion, map };
      await this.cache.store(studentId, envelope, generation);
    }
    return map;
  }

  private async readCached(studentId: string, ref: CurrentPathRef): Promise<StudentPathMap | null> {
    if (ref.contentVersion === null) {
      return null;
    }
    const envelope = await this.cache.read(studentId);
    return envelope?.pathId === ref.pathId && envelope.contentVersion === ref.contentVersion
      ? envelope.map
      : null;
  }

  private async compute(
    studentId: string,
    ref: CurrentPathRef,
    reviewBlock: ReviewBlock,
  ): Promise<StudentPathMap | null> {
    let state = await this.states.load(studentId, ref);
    if (state === null) {
      return null;
    }
    if (this.topicCompletion.needsReconcile(state)) {
      await this.topicCompletion.reconcile(state);
      state = await this.states.refresh(state);
    }
    return this.builder.build(state, reviewBlock);
  }
}
