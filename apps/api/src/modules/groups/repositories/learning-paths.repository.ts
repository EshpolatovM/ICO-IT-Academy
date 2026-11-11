import { Injectable } from '@nestjs/common';

import { BaseRepository } from '../../../common/repository/base.repository.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { LearningPath, Prisma } from '../../../infra/prisma/generated/client.js';
import type { LearningPathRecord } from '../groups.types.js';

export interface LearningPathRepositoryTypes extends RepositoryTypes {
  model: LearningPath;
  where: Prisma.LearningPathWhereInput;
  create: Prisma.LearningPathCreateInput;
  update: Prisma.LearningPathUpdateInput;
  orderBy: Prisma.LearningPathOrderByWithRelationInput[];
}

const REF_SELECT = {
  id: true,
  title: true,
  slug: true,
  status: true,
} as const satisfies Prisma.LearningPathSelect;

/**
 * `learning_paths` jadvali (docs/11 §3). 2-bosqichda faqat o'qish: guruh formasi uchun ro'yxat va
 * guruh yaratishda yo'l mavjudligini tekshirish. To'liq kontent CRUD — 3-bosqich.
 */
@Injectable()
export class LearningPathsRepository extends BaseRepository<LearningPathRepositoryTypes> {
  protected readonly defaultOrderBy: LearningPathRepositoryTypes['orderBy'] = [
    { title: 'asc' },
    { id: 'asc' },
  ];

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /** Joriy tranzaksiya (yoki standart `db`) — meros metodlar ham `UnitOfWork` ga qo'shiladi. */
  protected get delegate(): PrismaService['client']['learningPath'] {
    return this.prisma.client.learningPath;
  }

  listRefs(): Promise<LearningPathRecord[]> {
    return this.delegate.findMany({ orderBy: this.defaultOrderBy, select: REF_SELECT });
  }

  async exists(id: string): Promise<boolean> {
    const found = await this.delegate.findUnique({
      where: { id },
      select: { id: true },
    });
    return found !== null;
  }
}
