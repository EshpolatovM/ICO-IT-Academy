import { Injectable } from '@nestjs/common';

import { MentorStudentScope } from '../../../common/scope/mentor-student-scope.js';
import { MENTOR_SCOPE_EMPTY_MARKER } from '../groups.constants.js';
import { MentorScopeRepository } from '../repositories/mentor-scope.repository.js';

import { MentorScopeCache } from './mentor-scope-cache.service.js';

/**
 * `MentorStudentScope` amalga oshirilishi (docs/01 §3.1): student mentorning ACTIVE guruhlaridan
 * birining faol a'zosimi. Avval Redis set (`MentorScopeCache`), bo'lmasa — bazadan butun to'plam
 * o'qilib keshlanadi. Generatsiya DB o'qishidan OLDIN olinadi: oraliqda invalidatsiya bo'lsa,
 * eski to'plam keshga yozilmaydi (poyga himoyasi).
 */
@Injectable()
export class CachedMentorStudentScope extends MentorStudentScope {
  constructor(
    private readonly cache: MentorScopeCache,
    private readonly scope: MentorScopeRepository,
  ) {
    super();
  }

  async isMentorOf(mentorId: string, studentId: string): Promise<boolean> {
    if (studentId === MENTOR_SCOPE_EMPTY_MARKER) {
      return false;
    }
    const cached = await this.cache.has(mentorId, studentId);
    if (cached !== null) {
      return cached;
    }
    const generation = await this.cache.generation(mentorId);
    const studentIds = await this.scope.findStudentIds(mentorId);
    if (generation !== null) {
      await this.cache.store(mentorId, studentIds, generation);
    }
    return studentIds.includes(studentId);
  }
}
