import { Injectable, Logger } from '@nestjs/common';

import type { LearningEvent } from './learning.events.js';

/**
 * Domen hodisalari porti (3.3 §5): servislar faqat shunga bog'lanadi va hodisalarni faqat haqiqiy
 * o'tishda, commit'dan KEYIN chiqaradi. `@nestjs/event-emitter` tasdiqlansa (S-D2) faqat
 * implementatsiya almashadi.
 */
export abstract class LearningEventsPublisher {
  abstract publish(events: readonly LearningEvent[]): void;
}

/** 3-modul implementatsiyasi: tinglovchi yo'q, faqat `debug` log. */
@Injectable()
export class LoggingLearningEventsPublisher extends LearningEventsPublisher {
  private readonly logger = new Logger(LearningEventsPublisher.name);

  publish(events: readonly LearningEvent[]): void {
    for (const event of events) {
      this.logger.debug(`${event.name}: ${JSON.stringify(event.payload)}`);
    }
  }
}
