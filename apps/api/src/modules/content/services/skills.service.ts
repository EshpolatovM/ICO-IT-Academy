import { Injectable } from '@nestjs/common';

import { AuditAction, AuditEntityType } from '@lms/shared';
import type { SkillItem, SkillsResponse } from '@lms/shared';

import { UniqueViolationError } from '../../../common/exceptions/constraint-violation.error.js';
import { ContentField } from '../content.constants.js';
import { fieldTakenException, orNotFound } from '../content.errors.js';
import { toSkillItem } from '../mappers/content.mapper.js';
import { SkillsRepository } from '../repositories/skills.repository.js';

import { diffChanges, isEmptyDiff } from './content-changes.js';
import { ContentKit } from './content-kit.service.js';

import type { ContentEntity } from './content-auditor.service.js';
import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { CreateSkillDto, SkillsQueryDto, UpdateSkillDto } from '../dto/content.dto.js';

const skillEntity = (id: string): ContentEntity => ({ type: AuditEntityType.SKILL, id });

const nameTakenException = () =>
  fieldTakenException(ContentField.NAME, "Bu nomdagi ko'nikma allaqachon bor");

/** Poygada unique (`uq_skills_name`) buzilsa ham javob — 409 `{ field: "name" }`. */
async function guardName<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw error instanceof UniqueViolationError ? nameTakenException() : error;
  }
}

/**
 * Ko'nikmalar (docs/12 §3): ro'yxat (offset, `q`, `name asc`), yaratish, PATCH, o'chirish
 * (`topic_skills` kaskad). Nom/ikonka xaritaga ta'sir qilmaydi — kontent versiyasi oshmaydi.
 */
@Injectable()
export class SkillsService {
  constructor(
    private readonly skills: SkillsRepository,
    private readonly kit: ContentKit,
  ) {}

  async list(query: SkillsQueryDto): Promise<SkillsResponse> {
    const page = await this.skills.search(query);
    return {
      items: page.items.map(toSkillItem),
      total: page.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(request: CreateSkillDto, actor: ActorContext): Promise<SkillItem> {
    const id = await guardName(() =>
      this.kit.transaction.commit(async () => {
        if (await this.skills.isNameTaken(request.name)) {
          throw nameTakenException();
        }
        const created = await this.skills.createSkill({
          name: request.name,
          icon: request.icon ?? null,
        });
        await this.kit.auditor.record(AuditAction.CONTENT_CREATED, skillEntity(created.id), actor, {
          after: { name: request.name, parentId: null },
        });
        return { result: created.id, changedPathIds: [] };
      }),
    );
    return this.item(id);
  }

  async update(id: string, request: UpdateSkillDto, actor: ActorContext): Promise<SkillItem> {
    await guardName(() =>
      this.kit.transaction.commit(async () => {
        const current = orNotFound(await this.skills.lockRecord(id));
        const diff = diffChanges(current, request);
        if (diff.name !== undefined && (await this.skills.isNameTaken(diff.name, id))) {
          throw nameTakenException();
        }
        if (!isEmptyDiff(diff)) {
          await this.skills.applyChanges(id, diff);
          await this.kit.auditor.recordPatch(skillEntity(id), actor, current, diff);
        }
        return { result: undefined, changedPathIds: [] };
      }),
    );
    return this.item(id);
  }

  async remove(id: string, actor: ActorContext): Promise<void> {
    await this.kit.transaction.commit(async () => {
      const current = orNotFound(await this.skills.lockRecord(id));
      await this.skills.deleteById(id);
      await this.kit.auditor.record(AuditAction.CONTENT_DELETED, skillEntity(id), actor, {
        before: { name: current.name, parentId: null },
      });
      return { result: undefined, changedPathIds: [] };
    });
  }

  private async item(id: string): Promise<SkillItem> {
    return toSkillItem(orNotFound(await this.skills.findRecord(id)));
  }
}
