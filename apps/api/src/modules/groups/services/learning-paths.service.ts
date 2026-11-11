import { Injectable } from '@nestjs/common';

import type { LearningPathsResponse } from '@lms/shared';

import { toPathItem } from '../mappers/group.mapper.js';
import { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

/** Yo'llar ro'yxati — guruh formasi uchun (`GET /admin/paths`, SA A). To'liq CRUD — 3-bosqich. */
@Injectable()
export class LearningPathsService {
  constructor(private readonly paths: LearningPathsRepository) {}

  async list(): Promise<LearningPathsResponse> {
    return { items: (await this.paths.listRefs()).map(toPathItem) };
  }
}
