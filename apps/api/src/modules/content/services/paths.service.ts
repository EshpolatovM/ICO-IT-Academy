import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType, ContentStatus } from '@lms/shared';
import type { AdminPathDetail, AdminPathsResponse } from '@lms/shared';

import {
  ForeignKeyViolationError,
  UniqueViolationError,
} from '../../../common/exceptions/constraint-violation.error.js';
import { ContentField } from '../content.constants.js';
import { fieldTakenException, orNotFound, pathInUseException } from '../content.errors.js';
import { toAdminPathItem } from '../mappers/content.mapper.js';
import { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

import { diffChanges, isEmptyDiff } from './content-changes.js';
import { ContentKit } from './content-kit.service.js';
import { PathDetailsService } from './path-details.service.js';
import { PathPublishService } from './path-publish.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { PathRecord } from '../content.types.js';
import type { ContentEntity } from './content-auditor.service.js';
import type { AdminPathsQueryDto, CreatePathDto, UpdatePathDto } from '../dto/content.dto.js';

const slugTakenException = () =>
  fieldTakenException(ContentField.SLUG, "Bu slug boshqa yo'lda band");

const pathEntity = (id: string): ContentEntity => ({ type: AuditEntityType.LEARNING_PATH, id });

/** Poygada unique (`uq_learning_paths_slug`) buzilsa ham javob — 409 `{ field: "slug" }`. */
async function guardSlug<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw error instanceof UniqueViolationError ? slugTakenException() : error;
  }
}

/**
 * Yo'llar (docs/12 §3, 3.2 §2): ro'yxat (`?status=`), tafsilot, yaratish (`DRAFT`), PATCH
 * (`status: PUBLISHED` — `PathPublishService`, kaskadsiz), o'chirish (ishlatilsa — 409 `PATH_IN_USE`).
 */
@Injectable()
export class PathsService {
  constructor(
    private readonly paths: LearningPathsRepository,
    private readonly details: PathDetailsService,
    private readonly publisher: PathPublishService,
    private readonly kit: ContentKit,
  ) {}

  async list(query: AdminPathsQueryDto): Promise<AdminPathsResponse> {
    return { items: (await this.paths.listItems(query.status)).map(toAdminPathItem) };
  }

  get(id: string): Promise<AdminPathDetail> {
    return this.details.get(id);
  }

  async create(request: CreatePathDto, actor: ActorContext): Promise<AdminPathDetail> {
    const { id } = await guardSlug(() =>
      this.kit.transaction.commit(async () => {
        if (await this.paths.isSlugTaken(request.slug)) {
          throw slugTakenException();
        }
        const created = await this.paths.createPath({
          title: request.title,
          slug: request.slug,
          description: request.description ?? null,
        });
        await this.kit.auditor.record(AuditAction.CONTENT_CREATED, pathEntity(created.id), actor, {
          after: { title: request.title, parentId: null },
        });
        return { result: created, changedPathIds: [created.id] };
      }),
    );
    return this.details.get(id);
  }

  async update(id: string, request: UpdatePathDto, actor: ActorContext): Promise<AdminPathDetail> {
    await guardSlug(() =>
      this.kit.transaction.commit(async () => {
        const current = orNotFound(await this.paths.lockRecord(id));
        const changed = await this.applyUpdate(current, request, actor);
        return { result: undefined, changedPathIds: changed ? [id] : [] };
      }),
    );
    return this.details.get(id);
  }

  async remove(id: string, actor: ActorContext): Promise<void> {
    try {
      await this.kit.transaction.commit(async () => {
        const current = orNotFound(await this.paths.lockRecord(id));
        const usage = await this.kit.progress.pathUsage(id);
        if (usage.inUse) {
          throw pathInUseException(usage.groupsCount);
        }
        await this.paths.deleteById(id);
        await this.kit.auditor.record(AuditAction.CONTENT_DELETED, pathEntity(id), actor, {
          before: { title: current.title, parentId: null },
        });
        return { result: undefined, changedPathIds: [id] };
      });
    } catch (error) {
      // Poyga: tekshiruvdan keyin guruh/enrollment paydo bo'ldi — rollback'dan keyin qayta sanaladi.
      if (error instanceof ForeignKeyViolationError) {
        throw pathInUseException((await this.kit.progress.pathUsage(id)).groupsCount);
      }
      throw error;
    }
  }

  /** Maydonlar (`CONTENT_UPDATED`) va holat (`CONTENT_STATUS_CHANGED`) alohida. O'zgardimi — `true`. */
  private async applyUpdate(
    current: PathRecord,
    request: UpdatePathDto,
    actor: ActorContext,
  ): Promise<boolean> {
    const { status, ...fields } = diffChanges(current, request);
    if (fields.slug !== undefined && (await this.paths.isSlugTaken(fields.slug, current.id))) {
      throw slugTakenException();
    }
    if (!isEmptyDiff(fields)) {
      await this.paths.applyChanges(current.id, fields);
      await this.kit.auditor.recordPatch(pathEntity(current.id), actor, current, fields);
    }
    const statusChanged = status !== undefined && (await this.applyStatus(current, status, actor));
    return !isEmptyDiff(fields) || statusChanged;
  }

  private async applyStatus(
    current: PathRecord,
    status: ContentStatus,
    actor: ActorContext,
  ): Promise<boolean> {
    if (status === ContentStatus.PUBLISHED) {
      return this.publisher.publishLocked(current, false, actor);
    }
    await this.paths.applyChanges(current.id, { status });
    await this.kit.auditor.recordStatus(pathEntity(current.id), actor, current.status, { status });
    return true;
  }
}
