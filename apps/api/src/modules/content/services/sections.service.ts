import { Injectable } from '@nestjs/common';

import { AuditEntityType } from '@lms/shared';
import type { AdminSectionNode } from '@lms/shared';

import { ProgressScope } from '../repositories/content-progress.repository.js';
import { PathSectionsRepository } from '../repositories/path-sections.repository.js';

import { ContentKit } from './content-kit.service.js';
import { ContentNodeService } from './content-node.service.js';
import { PathTreeService } from './path-tree.service.js';

import type { SectionChanges, SectionFields, SectionRecord } from '../content.types.js';
import type { CreateSectionDto } from '../dto/content.dto.js';

/** Bo'limlar (docs/12 §3): ota — yo'l; javob — bo'lim tuguni (mavzular va sandiqlar bilan). */
@Injectable()
export class SectionsService extends ContentNodeService<
  SectionRecord,
  CreateSectionDto,
  SectionFields,
  SectionChanges,
  AdminSectionNode
> {
  protected readonly entityType = AuditEntityType.PATH_SECTION;
  protected readonly progressScope = ProgressScope.SECTION;

  constructor(
    sections: PathSectionsRepository,
    kit: ContentKit,
    private readonly tree: PathTreeService,
  ) {
    super(sections, kit);
  }

  protected loadNode(id: string): Promise<AdminSectionNode> {
    return this.tree.section(id);
  }

  protected toFields(request: CreateSectionDto): SectionFields {
    return { title: request.title, description: request.description ?? null };
  }
}
