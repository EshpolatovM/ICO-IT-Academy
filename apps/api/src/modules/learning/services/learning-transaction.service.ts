import { Injectable } from '@nestjs/common';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';
import { LearningEventsPublisher } from '../events/learning-events-publisher.js';

import { StudentPathCache } from './student-path-cache.service.js';

import type { LearningEvent } from '../events/learning.events.js';

/** Tranzaksiya natijasi va commit'dan keyin chiqariladigan hodisalar. */
export interface LearningChange<T> {
  result: T;
  events: readonly LearningEvent[];
}

/**
 * Student progressi o'zgarishi (`ContentTransaction` naqshi): yozuvlar — bitta `UnitOfWork` da, so'ng
 * (commit'dan keyin; tranzaksiya ichida Redis yo'q) xarita keshi invalidatsiyasi va domen hodisalari
 * (3.3 §4.6–§4.8, §5). Rollback bo'lsa — invalidatsiya ham, hodisa ham yo'q.
 */
@Injectable()
export class LearningTransaction {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly cache: StudentPathCache,
    private readonly events: LearningEventsPublisher,
  ) {}

  async commit<T>(studentId: string, work: () => Promise<LearningChange<T>>): Promise<T> {
    const { result, events } = await this.unitOfWork.run(work);
    await this.cache.invalidate(studentId);
    this.events.publish(events);
    return result;
  }
}
