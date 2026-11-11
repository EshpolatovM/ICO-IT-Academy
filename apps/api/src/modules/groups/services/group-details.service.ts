import { Injectable } from '@nestjs/common';

import type { AdminGroupDetail } from '@lms/shared';

import { groupNotFoundException } from '../groups.errors.js';
import { toAdminGroupDetail } from '../mappers/group.mapper.js';
import { GroupMembersRepository } from '../repositories/group-members.repository.js';
import { GroupsRepository } from '../repositories/groups.repository.js';

import type { GroupRecord } from '../groups.types.js';

/**
 * Guruhni topish (yo'q yoki o'chirilgan — 404), qulflab topish (o'zgarishlar uchun, tranzaksiya
 * ichida) va admin tafsiloti (faol a'zolar bilan).
 */
@Injectable()
export class GroupDetailsService {
  constructor(
    private readonly groups: GroupsRepository,
    private readonly members: GroupMembersRepository,
  ) {}

  async requireGroup(id: string): Promise<GroupRecord> {
    const record = await this.groups.findRecord(id);
    if (!record) {
      throw groupNotFoundException();
    }
    return record;
  }

  /** `UnitOfWork` ichida: qatorni `FOR UPDATE` bilan qulflaydi — tekshiruvlar shu yozuvdan. */
  async requireLockedGroup(id: string): Promise<GroupRecord> {
    const record = await this.groups.lockRecord(id);
    if (!record) {
      throw groupNotFoundException();
    }
    return record;
  }

  async detail(id: string): Promise<AdminGroupDetail> {
    const record = await this.requireGroup(id);
    return toAdminGroupDetail(record, await this.members.listActiveMembers(id));
  }
}
