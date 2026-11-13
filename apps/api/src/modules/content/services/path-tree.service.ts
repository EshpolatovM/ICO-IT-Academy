import { Injectable } from '@nestjs/common';

import type { AdminPathTree, AdminSectionNode, AdminTopicNode } from '@lms/shared';

import { orNotFound } from '../content.errors.js';
import { PathTreeRepository } from '../repositories/path-tree.repository.js';

import { PathDetailsService } from './path-details.service.js';

/**
 * Admin daraxti (`GET /admin/paths/:id/tree`, SA A M): barcha holatlar, `order` bo'yicha; keshlanmaydi
 * (admin doim yangi holatni ko'radi). Bo'lim/mavzu mutatsiyalari javobidagi tugunlar ham shu yerdan.
 */
@Injectable()
export class PathTreeService {
  constructor(
    private readonly nodes: PathTreeRepository,
    private readonly details: PathDetailsService,
  ) {}

  async tree(pathId: string): Promise<AdminPathTree> {
    const path = await this.details.get(pathId);
    return { path, sections: orNotFound(await this.nodes.findSections(pathId)) };
  }

  async section(id: string): Promise<AdminSectionNode> {
    return orNotFound(await this.nodes.findSection(id));
  }

  async topic(id: string): Promise<AdminTopicNode> {
    return orNotFound(await this.nodes.findTopic(id));
  }
}
