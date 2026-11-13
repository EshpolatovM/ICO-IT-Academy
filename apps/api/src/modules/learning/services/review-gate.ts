import { Injectable } from '@nestjs/common';

import type { ReviewBlock, ReviewRequiredDetails } from '@lms/shared';

/** `ReviewGate.check` natijasi. */
export type ReviewGateResult = { allowed: true } | ({ allowed: false } & ReviewRequiredDetails);

/**
 * "Yangi dars takrorlashdan keyin" (S-30) kengayish nuqtasi (3.3 §4.9). 6-modul faqat
 * `LearningModule` dagi `useClass` ni almashtiradi.
 */
export abstract class ReviewGate {
  /** Xarita uchun: `{ blocked, dueCount }`. */
  abstract status(studentId: string): Promise<ReviewBlock>;
  /** Yangi (boshlanmagan) darsni boshlashdan oldin; bloklangan bo'lsa `due` ro'yxati. */
  abstract check(studentId: string): Promise<ReviewGateResult>;
}

/** 3-modul: takrorlash yo'q — doim o'tkazadi. */
@Injectable()
export class PassThroughReviewGate extends ReviewGate {
  status(): Promise<ReviewBlock> {
    return Promise.resolve({ blocked: false, dueCount: 0 });
  }

  check(): Promise<ReviewGateResult> {
    return Promise.resolve({ allowed: true });
  }
}
