import { Injectable } from '@nestjs/common';

import { AuditEntityType, ContentStatus } from '@lms/shared';
import type { AdminPathDetail } from '@lms/shared';

import { orNotFound } from '../content.errors.js';
import { LearningPathsRepository } from '../repositories/learning-paths.repository.js';
import { PathPublishRepository } from '../repositories/path-publish.repository.js';

import { ContentKit } from './content-kit.service.js';
import { PathDetailsService } from './path-details.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { PathRecord, PublishedCounts } from '../content.types.js';

function totalOf(counts: PublishedCounts): number {
  return counts.sections + counts.topics + counts.lessons;
}

/**
 * Yo'lni nashr qilish (R Q-3, R Q-8): `POST /admin/paths/:id/publish` va `PATCH status: PUBLISHED`
 * ikkalasi shu yerga keladi. Yo'l `→ PUBLISHED`; `cascade: true` — shu tranzaksiyada yo'l ostidagi
 * `DRAFT` bolalar ham (`ARCHIVED` ota ichidagilari va `ARCHIVED` lar tegilmaydi). Idempotent: hech
 * narsa o'zgarmasa — audit va versiya bump yo'q. Kaskad — bitta audit yozuvi (sonlar bilan).
 */
@Injectable()
export class PathPublishService {
  constructor(
    private readonly paths: LearningPathsRepository,
    private readonly publisher: PathPublishRepository,
    private readonly details: PathDetailsService,
    private readonly kit: ContentKit,
  ) {}

  async publish(id: string, cascade: boolean, actor: ActorContext): Promise<AdminPathDetail> {
    await this.kit.transaction.commit(async () => {
      const path = orNotFound(await this.paths.lockRecord(id));
      const changed = await this.publishLocked(path, cascade, actor);
      return { result: undefined, changedPathIds: changed ? [id] : [] };
    });
    return this.details.get(id);
  }

  /** Qulflangan yo'l uchun (chaqiruvchining tranzaksiyasida). O'zgarish bo'ldimi — `true`. */
  async publishLocked(path: PathRecord, cascade: boolean, actor: ActorContext): Promise<boolean> {
    const pathChanged = path.status !== ContentStatus.PUBLISHED;
    if (pathChanged) {
      await this.paths.applyChanges(path.id, { status: ContentStatus.PUBLISHED });
    }
    const published = cascade ? await this.publisher.publishDrafts(path.id) : null;
    if (!pathChanged && (published === null || totalOf(published) === 0)) {
      return false;
    }
    await this.kit.auditor.recordStatus(
      { type: AuditEntityType.LEARNING_PATH, id: path.id },
      actor,
      path.status,
      {
        status: ContentStatus.PUBLISHED,
        ...(published === null ? {} : { cascade: true, published: { ...published } }),
      },
    );
    return true;
  }
}
