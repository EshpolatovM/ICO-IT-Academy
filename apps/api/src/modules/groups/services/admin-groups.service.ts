import { Injectable } from '@nestjs/common';

import { AuditAction, GroupStatus } from '@lms/shared';
import type { AdminGroupDetail, AdminGroupListItem, PaginatedResult } from '@lms/shared';

import { fromDateOnly, toAdminGroupItem } from '../mappers/group.mapper.js';
import { GroupsRepository } from '../repositories/groups.repository.js';

import { GroupAuditor } from './group-auditor.service.js';
import { diffGroupChanges, groupChangeSnapshots, newGroupSnapshot } from './group-changes.js';
import { GroupDetailsService } from './group-details.service.js';
import { GroupReferences } from './group-references.service.js';
import { GroupTransaction } from './group-transaction.service.js';

import type { ActorContext } from '../../../common/auth/request-user.types.js';
import type { CreateGroupDto, GroupListQueryDto, UpdateGroupDto } from '../dto/groups.dto.js';
import type { NewGroupData } from '../groups.types.js';
import type { GroupChange } from './group-transaction.service.js';

/**
 * Guruhlar boshqaruvi (docs/12 §2: SA A): ro'yxat, tafsilot, yaratish, o'zgartirish (nom, holat,
 * boshlanish sanasi). Yozuv va audit — bitta tranzaksiyada; PATCH da diff qulflangan guruh qatoridan
 * hisoblanadi; holat o'zgarsa (arxivlash/qayta faollashtirish) — commit'dan keyin mentor scope keshi
 * invalidatsiya qilinadi.
 */
@Injectable()
export class AdminGroupsService {
  constructor(
    private readonly groups: GroupsRepository,
    private readonly details: GroupDetailsService,
    private readonly references: GroupReferences,
    private readonly auditor: GroupAuditor,
    private readonly transaction: GroupTransaction,
  ) {}

  async list(query: GroupListQueryDto): Promise<PaginatedResult<AdminGroupListItem>> {
    const page = await this.groups.search(query);
    return {
      items: page.items.map(toAdminGroupItem),
      total: page.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  get(id: string): Promise<AdminGroupDetail> {
    return this.details.detail(id);
  }

  async create(request: CreateGroupDto, actor: ActorContext): Promise<AdminGroupDetail> {
    const data: NewGroupData = {
      name: request.name,
      pathId: request.pathId,
      mentorId: request.mentorId ?? null,
      startsAt: fromDateOnly(request.startsAt) ?? null,
    };
    // Yangi guruhda a'zo yo'q — mentor scope'i o'zgarmaydi.
    const { id } = await this.transaction.commit(async () => {
      await this.references.requirePath(data.pathId);
      if (data.mentorId !== null) {
        await this.references.requireActiveMentor(data.mentorId);
      }
      const created = await this.groups.createGroup(data);
      await this.auditor.record(AuditAction.GROUP_CREATED, created.id, actor, {
        after: newGroupSnapshot({ ...data, status: GroupStatus.ACTIVE }),
      });
      return { result: created, affectedMentorIds: [] };
    });
    return this.details.detail(id);
  }

  async update(
    id: string,
    request: UpdateGroupDto,
    actor: ActorContext,
  ): Promise<AdminGroupDetail> {
    await this.transaction.commit(async (): Promise<GroupChange<void>> => {
      const target = await this.details.requireLockedGroup(id);
      const diff = diffGroupChanges(target, request);
      if (Object.keys(diff).length === 0) {
        return { result: undefined, affectedMentorIds: [] };
      }
      await this.groups.applyChanges(id, diff);
      await this.auditor.record(
        AuditAction.GROUP_UPDATED,
        id,
        actor,
        groupChangeSnapshots(target, diff),
      );
      // Holat (arxivlash/qayta faollashtirish) mentor scope'iga ta'sir qiladi.
      const affectedMentorIds = diff.status === undefined ? [] : [target.mentor?.id ?? null];
      return { result: undefined, affectedMentorIds };
    });
    return this.details.detail(id);
  }
}
