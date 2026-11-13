import { Injectable } from '@nestjs/common';

import { ContentCacheVersion } from '../../content/services/content-cache-version.service.js';
import { StudentCurrentPathRepository } from '../repositories/student-current-path.repository.js';

/** Joriy yo'l va uning kontent versiyasi (kesh kalitlari uchun). */
export interface CurrentPathRef {
  pathId: string;
  /** `null` — Redis ishlamayapti (keshlar chetlab o'tiladi). */
  contentVersion: string | null;
}

/**
 * Studentning joriy yo'li (3.3 §4.1): faol a'zolik → `groups.path_id` → yo'l `PUBLISHED`.
 * Har doim DB'dan (bitta indeksli so'rov) — guruh almashsa eski xarita ko'rinmasin. Yo'q — `null`.
 */
@Injectable()
export class StudentPathResolver {
  constructor(
    private readonly currentPath: StudentCurrentPathRepository,
    private readonly contentVersion: ContentCacheVersion,
  ) {}

  async resolve(studentId: string): Promise<CurrentPathRef | null> {
    const pathId = await this.currentPath.findPublishedPathId(studentId);
    return pathId === null
      ? null
      : { pathId, contentVersion: await this.contentVersion.current(pathId) };
  }
}
