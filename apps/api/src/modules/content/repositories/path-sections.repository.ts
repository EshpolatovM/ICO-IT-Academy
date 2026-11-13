import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { Prisma } from '../../../infra/prisma/generated/client.js';
import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import { OrderedContentRepository } from './ordered-content.repository.js';

import type { RepositoryTypes } from '../../../common/repository/repository.types.js';
import type { PathSection } from '../../../infra/prisma/generated/client.js';
import type {
  NewNodeData,
  SectionChanges,
  SectionFields,
  SectionRecord,
} from '../content.types.js';

export interface PathSectionRepositoryTypes extends RepositoryTypes {
  model: PathSection;
  where: Prisma.PathSectionWhereInput;
  create: Prisma.PathSectionUncheckedCreateInput;
  update: Prisma.PathSectionUpdateInput;
  orderBy: Prisma.PathSectionOrderByWithRelationInput[];
}

const RECORD_SELECT = {
  id: true,
  pathId: true,
  title: true,
  description: true,
  status: true,
} as const satisfies Prisma.PathSectionSelect;

/** `path_sections` (docs/11 §3): ota — yo'l. */
@Injectable()
export class PathSectionsRepository extends OrderedContentRepository<
  PathSectionRepositoryTypes,
  SectionRecord,
  SectionFields,
  SectionChanges
> {
  protected readonly defaultOrderBy: PathSectionRepositoryTypes['orderBy'] = [
    { order: 'asc' },
    { id: 'asc' },
  ];
  protected readonly table = 'path_sections';
  protected readonly parentColumn = 'path_id';

  protected get delegate(): PrismaService['client']['pathSection'] {
    return this.prisma.client.pathSection;
  }

  protected lockParentQuery(pathId: string): Prisma.Sql {
    return Prisma.sql`SELECT id AS path_id FROM learning_paths WHERE id = ${pathId}::uuid FOR UPDATE`;
  }

  async findRecord(id: string): Promise<SectionRecord | null> {
    const row = await this.delegate.findUnique({ where: { id }, select: RECORD_SELECT });
    return row ? { ...row, parentId: row.pathId } : null;
  }

  createNode({ parentId, order, fields }: NewNodeData<SectionFields>): Promise<{ id: string }> {
    return this.delegate.create({
      data: { ...fields, pathId: parentId, order, status: ContentStatus.DRAFT },
      select: { id: true },
    });
  }
}
