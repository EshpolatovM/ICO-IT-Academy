import { Injectable } from '@nestjs/common';

import type { GroupRef } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';

const REF_SELECT = { id: true, name: true } as const satisfies Prisma.GroupSelect;

/** Faol guruh: `status = ACTIVE` (o'chirilganlar soft delete extension orqali yashiriladi). */
const ACTIVE_GROUP = { status: 'ACTIVE' } as const satisfies Prisma.GroupWhereInput;

/**
 * `groups` jadvali — 2.2 uchun faqat o'qish (studentni guruhga qo'shishda guruhni tekshirish).
 * `BaseRepository` CRUD'i 2.3 da (guruhlar boshqaruvi) qo'shiladi. O'qish joriy tranzaksiyada
 * (`PrismaService.client`) — tekshiruv va a'zo qo'shish bitta `UnitOfWork` ichida.
 */
@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveRef(id: string): Promise<GroupRef | null> {
    return this.prisma.client.group.findFirst({
      where: { id, ...ACTIVE_GROUP },
      select: REF_SELECT,
    });
  }

  /** Nomlari bo'yicha faol guruhlar (katta-kichik harf farqisiz). Bir nomda bir nechta bo'lishi mumkin. */
  findActiveRefsByNames(names: readonly string[]): Promise<GroupRef[]> {
    if (names.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.client.group.findMany({
      where: {
        ...ACTIVE_GROUP,
        OR: names.map((name) => ({ name: { equals: name, mode: 'insensitive' as const } })),
      },
      orderBy: { name: 'asc' },
      select: REF_SELECT,
    });
  }
}
