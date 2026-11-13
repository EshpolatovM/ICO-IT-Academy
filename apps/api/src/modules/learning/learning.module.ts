import { Module } from '@nestjs/common';

import { ContentModule } from '../content/content.module.js';

import { StudentPathController } from './controllers/student-path.controller.js';
import {
  LearningEventsPublisher,
  LoggingLearningEventsPublisher,
} from './events/learning-events-publisher.js';
import { EnrollmentsRepository } from './repositories/enrollments.repository.js';
import { LessonContentRepository } from './repositories/lesson-content.repository.js';
import { LessonProgressRepository } from './repositories/lesson-progress.repository.js';
import { ProgressSnapshotRepository } from './repositories/progress-snapshot.repository.js';
import { StudentCurrentPathRepository } from './repositories/student-current-path.repository.js';
import { TopicProgressRepository } from './repositories/topic-progress.repository.js';
import { VisiblePathRepository } from './repositories/visible-path.repository.js';
import { LearningTransaction } from './services/learning-transaction.service.js';
import { LessonAccessGuardService } from './services/lesson-access-guard.service.js';
import { LessonCompletionService } from './services/lesson-completion.service.js';
import { LessonProgressWriter } from './services/lesson-progress-writer.service.js';
import { LessonStartService } from './services/lesson-start.service.js';
import { PathEnrollmentService } from './services/path-enrollment.service.js';
import { PathProgressCalculator } from './services/path-progress-calculator.js';
import { PathUnlockCalculator } from './services/path-unlock-calculator.js';
import { PassThroughReviewGate, ReviewGate } from './services/review-gate.js';
import { StudentLessonService } from './services/student-lesson.service.js';
import { StudentPathCache } from './services/student-path-cache.service.js';
import { StudentPathMapBuilder } from './services/student-path-map-builder.js';
import { StudentPathMapService } from './services/student-path-map.service.js';
import { StudentPathResolver } from './services/student-path-resolver.service.js';
import { StudentPathStateService } from './services/student-path-state.service.js';
import { StudentTopicService } from './services/student-topic.service.js';
import { TopicCompletionService } from './services/topic-completion.service.js';
import { VisiblePathLoader } from './services/visible-path-loader.service.js';

/**
 * Student ilm yo'li (docs/12 §4, 3.3): xarita, mavzu, dars, start/complete, lazy enrollment.
 * `GroupsModule` import qilinmaydi — faol yo'l o'z repository'sida (aylanma bog'liqlik yo'q).
 * `ReviewGate` (6-modul) va `LearningEventsPublisher` (S-D2) — `useClass` almashtiriladi.
 */
@Module({
  imports: [ContentModule],
  controllers: [StudentPathController],
  providers: [
    StudentCurrentPathRepository,
    EnrollmentsRepository,
    VisiblePathRepository,
    ProgressSnapshotRepository,
    TopicProgressRepository,
    LessonProgressRepository,
    LessonContentRepository,
    StudentPathCache,
    VisiblePathLoader,
    StudentPathResolver,
    LearningTransaction,
    PathEnrollmentService,
    PathUnlockCalculator,
    PathProgressCalculator,
    StudentPathStateService,
    StudentPathMapBuilder,
    LessonAccessGuardService,
    LessonProgressWriter,
    TopicCompletionService,
    LessonStartService,
    LessonCompletionService,
    StudentPathMapService,
    StudentTopicService,
    StudentLessonService,
    { provide: ReviewGate, useClass: PassThroughReviewGate },
    { provide: LearningEventsPublisher, useClass: LoggingLearningEventsPublisher },
  ],
})
export class LearningModule {}
