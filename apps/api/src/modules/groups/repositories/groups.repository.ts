import { Injectable } from '@nestjs/common';

import { GroupStatus } from '@lms/shared';
import type { GroupRef } from '@lms/shared';

import { toSkipTake } from '../../../common/pagination/offset-pagination.util.js';
import { SoftDeletableBaseRepository } from '../../../common/repository/base.repository.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { ACTIVE_MEMBER_WHERE } from './group-members.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { Group, Prisma } from '../../../infra/prisma/generated/client.js';
import type {
  GroupChanges,
  GroupRecord,
  GroupSearchCriteria,
  GroupSearchPage,
  NewGroupData,
} from '../groups.types.js';

export interface GroupRepositoryTypes extends RepositoryTypes {
  model: Group;
  where: Prisma.GroupWhereInput;
  create: Prisma.GroupCreateInput;
  update: Prisma.GroupUpdateInput;
  orderBy: Prisma.GroupOrderByWithRelationInput[];
}

const REF_SELECT = { id: true, name: true } as const satisfies Prisma.GroupSelect;

/** Faol guruh: `status = ACTIVE` (o'chirilganlar soft delete extension orqali yashiriladi). */
const ACTIVE_GROUP = { status: GroupStatus.ACTIVE } as const satisfies Prisma.GroupWhereInput;

const RECORD_SELECT = {
  id: true,
  name: true,
  status: true,
  startsAt: true,
  createdAt: true,
  path: { select: { id: true, title: true } },
  mentor: { select: { id: true, firstName: true, lastName: true } },
  _count: { select: { members: { where: ACTIVE_MEMBER_WHERE } } },
} as const satisfies Prisma.GroupSelect;

type RecordRow = Prisma.GroupGetPayload<{ select: typeof RECORD_SELECT }>;

function toRecord({ _count, ...row }: RecordRow): GroupRecord {
  return { ...row, membersCount: _count.members };
}

function searchWhere(criteria: GroupSearchCriteria): Prisma.GroupWhereInput {
  return {
    status: criteria.status,
    mentorId: criteria.mentorId,
    pathId: criteria.pathId,
    ...(criteria.q === undefined ? {} : { name: { contains: criteria.q, mode: 'insensitive' } }),
  };
}

/**
 * `groups` jadvali (docs/11 §2): admin boshqaruvi (ro'yxat, tafsilot, yaratish, o'zgartirish,
 * mentor) va student yaratishda faol guruhni tekshirish. Yozuv/o'qish joriy tranzaksiyada
 * (`PrismaService.client`) — audit bilan bitta `UnitOfWork` da.
 */
@Injectable()
export class GroupsRepository extends SoftDeletableBaseRepository<GroupRepositoryTypes> {
  protected readonly defaultOrderBy: GroupRepositoryTypes['orderBy'] = [
    { createdAt: 'desc' },
    { id: 'desc' },
  ];

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** Joriy tranzaksiya (yoki standart `db`) — meros metodlar ham `UnitOfWork` ga qo'shiladi. */
  protected get delegate(): PrismaService['client']['group'] {
    return this.prisma.client.group;
  }

  /**
   * Guruh qatorini joriy tranzaksiya oxirigacha qulflaydi (`SELECT ... FOR UPDATE`): parallel a'zo
   * qo'shish, arxivlash va mentor almashtirish ketma-ket bajariladi. Faqat `UnitOfWork` ichida ma'noli.
   */
  async lockForUpdate(id: string): Promise<void> {
    await this.lockManyForUpdate([id]);
  }

  /**
   * Bir nechta guruh qatorini bitta so'rovda qulflaydi (`lockForUpdate` kabi). Qulflar `id` tartibida
   * olinadi — parallel tranzaksiyalar bir-birini teskari tartibda kutib deadlock'ga tushmaydi.
   */
  async lockManyForUpdate(ids: readonly string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.prisma.client.$queryRaw`SELECT id FROM groups
      WHERE id = ANY(${[...ids]}::uuid[]) AND deleted_at IS NULL ORDER BY id FOR UPDATE`;
  }

  /** Qulflab o'qish (`lockForUpdate` + `findRecord`). Yo'q yoki o'chirilgan — `null`. */
  async lockRecord(id: string): Promise<GroupRecord | null> {
    await this.lockForUpdate(id);
    return this.findRecord(id);
  }

  findActiveRef(id: string): Promise<GroupRef | null> {
    return this.delegate.findFirst({
      where: { id, ...ACTIVE_GROUP },
      select: REF_SELECT,
    });
  }

  /** Nomlari bo'yicha faol guruhlar (katta-kichik harf farqisiz). Bir nomda bir nechta bo'lishi mumkin. */
  findActiveRefsByNames(names: readonly string[]): Promise<GroupRef[]> {
    if (names.length === 0) {
      return Promise.resolve([]);
    }
    return this.delegate.findMany({
      where: {
        ...ACTIVE_GROUP,
        OR: names.map((name) => ({ name: { equals: name, mode: 'insensitive' as const } })),
      },
      orderBy: { name: 'asc' },
      select: REF_SELECT,
    });
  }

  /** Berilgan id'lar orasidan faol guruhlar. */
  findActiveRefs(ids: readonly string[]): Promise<GroupRef[]> {
    return this.delegate.findMany({
      where: { id: { in: [...ids] }, ...ACTIVE_GROUP },
      select: REF_SELECT,
    });
  }

  /** Guruhlar mentorlari (mentorsiz guruhlar tashlab ketiladi). */
  async findMentorIds(groupIds: readonly string[]): Promise<string[]> {
    const rows = await this.delegate.findMany({
      where: { id: { in: [...groupIds] }, mentorId: { not: null } },
      select: { mentorId: true },
    });
    return rows.flatMap((row) => (row.mentorId === null ? [] : [row.mentorId]));
  }

  async findRecord(id: string): Promise<GroupRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: RECORD_SELECT });
    return row ? toRecord(row) : null;
  }

  async search(criteria: GroupSearchCriteria): Promise<GroupSearchPage> {
    const where = searchWhere(criteria);
    const [rows, total] = await Promise.all([
      this.delegate.findMany({
        where,
        orderBy: this.defaultOrderBy,
        select: RECORD_SELECT,
        ...toSkipTake(criteria),
      }),
      this.delegate.count({ where }),
    ]);
    return { items: rows.map(toRecord), total };
  }

  async createGroup(data: NewGroupData): Promise<{ id: string }> {
    return this.delegate.create({
      data: { ...data, status: GroupStatus.ACTIVE },
      select: { id: true },
    });
  }

  async applyChanges(id: string, changes: GroupChanges): Promise<void> {
    await this.delegate.update({ where: { id }, data: changes, select: { id: true } });
  }

  async setMentor(id: string, mentorId: string | null): Promise<void> {
    await this.delegate.update({
      where: { id },
      data: { mentorId },
      select: { id: true },
    });
  }
}
