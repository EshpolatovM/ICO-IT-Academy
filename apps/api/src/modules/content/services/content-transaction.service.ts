import { Injectable } from '@nestjs/common';

import { UnitOfWork } from '../../../common/transaction/unit-of-work.js';

import { ContentCacheVersion } from './content-cache-version.service.js';

/** Tranzaksiya natijasi va kontent versiyasi oshiriladigan yo'llar (no-op — bo'sh ro'yxat). */
export interface ContentChange<T> {
  result: T;
  changedPathIds: readonly string[];
}

/**
 * Kontent o'zgarishi (2.3 `GroupTransaction` naqshi): yozuvlar va audit — bitta `UnitOfWork` da,
 * so'ng (commit'dan keyin; tranzaksiya ichida Redis ishlatilmaydi) o'zgargan yo'llar versiyasi
 * oshiriladi. Xato bo'lsa (rollback) — bump yo'q. Bump xato tashlamaydi (B1).
 */
@Injectable()
export class ContentTransaction {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly version: ContentCacheVersion,
  ) {}

  async commit<T>(work: () => Promise<ContentChange<T>>): Promise<T> {
    const { result, changedPathIds } = await this.unitOfWork.run(work);
    await this.version.bump(changedPathIds);
    return result;
  }
}
