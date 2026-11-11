import { Injectable } from '@nestjs/common';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';

import { MentorScopeCache } from './mentor-scope-cache.service.js';

/** Tranzaksiya natijasi va scope keshi invalidatsiya qilinadigan mentorlar (qulflangan qatordan). */
export interface GroupChange<T> {
  result: T;
  affectedMentorIds: readonly (string | null)[];
}

/**
 * Guruh o'zgarishi: yozuvlar va audit — bitta tranzaksiyada (`UnitOfWork`), so'ng (commit'dan
 * keyin, tranzaksiya ichida Redis ishlatilmaydi) ta'sirlangan mentorlarning scope keshi
 * invalidatsiya qilinadi (docs/01 §3.2 p.5, S-10 A). Mentorlar ro'yxatini `work` o'zi qaytaradi —
 * u tranzaksiya ichida qulflangan guruh qatoridan olinadi (eskirgan o'qish emas).
 * Invalidatsiya xato tashlamaydi (B1): baza yozildi — javob ham muvaffaqiyatli.
 */
@Injectable()
export class GroupTransaction {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly scopeCache: MentorScopeCache,
  ) {}

  async commit<T>(work: () => Promise<GroupChange<T>>): Promise<T> {
    const { result, affectedMentorIds } = await this.unitOfWork.run(work);
    await this.scopeCache.invalidate(...affectedMentorIds);
    return result;
  }
}
