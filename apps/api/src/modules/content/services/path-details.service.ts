import { Injectable } from '@nestjs/common';

import type { AdminPathDetail } from '@lms/shared';

import { orNotFound } from '../content.errors.js';
import { toAdminPathDetail } from '../mappers/content.mapper.js';
import { LearningPathsRepository } from '../repositories/learning-paths.repository.js';

/** Yo'l tafsiloti (`AdminPathDetail`) — mutatsiyalar javobi va daraxt uchun umumiy. Yo'q — 404. */
@Injectable()
export class PathDetailsService {
  constructor(private readonly paths: LearningPathsRepository) {}

  async get(id: string): Promise<AdminPathDetail> {
    return toAdminPathDetail(orNotFound(await this.paths.findRecord(id)));
  }
}
