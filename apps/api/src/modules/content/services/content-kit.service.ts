import { Injectable } from '@nestjs/common';

import { ContentProgressRepository } from '../repositories/content-progress.repository.js';

import { ContentAuditor } from './content-auditor.service.js';
import { ContentTransaction } from './content-transaction.service.js';

/**
 * Kontent servislarining umumiy bog'liqliklari bitta joyda (tranzaksiya + kesh versiyasi, audit,
 * progress tekshiruvlari) — har servisda takrorlanmasin va `max-params` chegarasida qolsin.
 */
@Injectable()
export class ContentKit {
  constructor(
    readonly transaction: ContentTransaction,
    readonly auditor: ContentAuditor,
    readonly progress: ContentProgressRepository,
  ) {}
}
