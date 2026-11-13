import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';

import { AdminChestsController } from './controllers/admin-chests.controller.js';
import { AdminLessonsController } from './controllers/admin-lessons.controller.js';
import { AdminPathsController } from './controllers/admin-paths.controller.js';
import { AdminSectionsController } from './controllers/admin-sections.controller.js';
import { AdminSkillsController } from './controllers/admin-skills.controller.js';
import { AdminTopicsController } from './controllers/admin-topics.controller.js';
import { ContentProgressRepository } from './repositories/content-progress.repository.js';
import { LearningPathsRepository } from './repositories/learning-paths.repository.js';
import { LessonsRepository } from './repositories/lessons.repository.js';
import { PathChestsRepository } from './repositories/path-chests.repository.js';
import { PathPublishRepository } from './repositories/path-publish.repository.js';
import { PathSectionsRepository } from './repositories/path-sections.repository.js';
import { PathTreeRepository } from './repositories/path-tree.repository.js';
import { SkillsRepository } from './repositories/skills.repository.js';
import { TopicSkillsRepository } from './repositories/topic-skills.repository.js';
import { TopicsRepository } from './repositories/topics.repository.js';
import { ChestsService } from './services/chests.service.js';
import { ContentAuditor } from './services/content-auditor.service.js';
import { ContentCacheVersion } from './services/content-cache-version.service.js';
import { ContentKit } from './services/content-kit.service.js';
import { ContentOrderService } from './services/content-order.service.js';
import { ContentTransaction } from './services/content-transaction.service.js';
import { LessonsService } from './services/lessons.service.js';
import { PathDetailsService } from './services/path-details.service.js';
import { PathPublishService } from './services/path-publish.service.js';
import { PathTreeService } from './services/path-tree.service.js';
import { PathsService } from './services/paths.service.js';
import { SectionsService } from './services/sections.service.js';
import { SkillsService } from './services/skills.service.js';
import { TopicSkillsService } from './services/topic-skills.service.js';
import { TopicsService } from './services/topics.service.js';

/**
 * Ilm yo'li kontenti — admin (docs/12 §3, 3.2): yo'llar, bo'limlar, mavzular, darslar, sandiqlar,
 * ko'nikmalar; nashr, tartiblash, audit, kontent versiyasi (Redis). Eksport: `LearningPathsRepository`
 * (guruh yo'lini tekshirish — `GroupsModule`), `ContentCacheVersion` (3.3 kesh kalitlari).
 */
@Module({
  imports: [AuditModule],
  controllers: [
    AdminPathsController,
    AdminSectionsController,
    AdminTopicsController,
    AdminLessonsController,
    AdminChestsController,
    AdminSkillsController,
  ],
  providers: [
    LearningPathsRepository,
    PathSectionsRepository,
    TopicsRepository,
    LessonsRepository,
    PathChestsRepository,
    SkillsRepository,
    TopicSkillsRepository,
    PathTreeRepository,
    PathPublishRepository,
    ContentProgressRepository,
    ContentCacheVersion,
    ContentTransaction,
    ContentAuditor,
    ContentKit,
    PathDetailsService,
    PathPublishService,
    PathsService,
    PathTreeService,
    SectionsService,
    TopicsService,
    LessonsService,
    ContentOrderService,
    ChestsService,
    SkillsService,
    TopicSkillsService,
  ],
  exports: [LearningPathsRepository, ContentCacheVersion],
})
export class ContentModule {}
