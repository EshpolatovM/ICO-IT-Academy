import { randomBytes } from 'node:crypto';

import { ContentStatus } from '@lms/shared';
import type { ChestReward } from '@lms/shared';

import { PrismaService } from '../../src/infra/prisma/prisma.service.js';
import { RedisService } from '../../src/infra/redis/redis.service.js';
import { contentVersionKey } from '../../src/modules/content/services/content-cache-version.service.js';

import type { AuthFixtures } from './auth-fixtures.js';
import type { PrismaClient } from '../../src/infra/prisma/generated/client.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

const SUFFIX_BYTES = 4;
/** `createTree` dagi mavzular soni (`TestTree.topicIds` uzunligi). */
const TREE_TOPICS = 3;

export const TEST_REWARD: ChestReward = { xp: { min: 50, max: 50 }, coin: { min: 10, max: 30 } };

/** `E2E-` slug/nom qo'shimchasi — dev yozuvlari bilan to'qnashmaydi. */
export function uniqueSuffix(): string {
  return randomBytes(SUFFIX_BYTES).toString('hex');
}

interface NodeOptions {
  status?: ContentStatus;
  order?: number;
}

/** Yo'l → bo'lim → 3 mavzu (har birida 1 dars), barchasi `DRAFT`. */
export interface TestTree {
  pathId: string;
  sectionId: string;
  topicIds: [string, string, string];
  lessonIds: [string, string, string];
}

/**
 * Berilgan test yo'llari (kontent kaskad bilan), ularga bog'langan progress, enrollment va guruhlar
 * hamda test ko'nikmalarini o'chiradi. Progress `users` ga `Restrict` — foydalanuvchilardan oldin.
 */
export async function deleteTestContent(
  db: PrismaClient,
  pathIds: readonly string[],
  skillIds: readonly string[],
): Promise<void> {
  const inPaths = { in: [...pathIds] };
  await db.lessonProgress.deleteMany({
    where: { lesson: { topic: { section: { pathId: inPaths } } } },
  });
  await db.topicProgress.deleteMany({ where: { topic: { section: { pathId: inPaths } } } });
  await db.studentPathEnrollment.deleteMany({ where: { pathId: inPaths } });
  await db.groupMember.deleteMany({ where: { group: { pathId: inPaths } } });
  await db.group.deleteMany({ where: { pathId: inPaths } });
  await db.learningPath.deleteMany({ where: { id: inPaths } });
  await db.skill.deleteMany({ where: { id: { in: [...skillIds] } } });
}

/**
 * Kontent test yozuvlari (to'g'ridan-to'g'ri bazaga) va API orqali yaratilganlarni kuzatish.
 * Tozalash `AuthFixtures.cleanup()` boshida (foydalanuvchilardan oldin) bajariladi.
 */
export class ContentFixtures {
  private readonly pathIds: string[] = [];
  private readonly skillIds: string[] = [];

  constructor(
    private readonly app: INestApplication<App>,
    fixtures: AuthFixtures,
  ) {
    fixtures.beforeCleanup(() => deleteTestContent(this.db(), this.pathIds, this.skillIds));
  }

  trackPath(id: string): void {
    this.pathIds.push(id);
  }

  trackSkill(id: string): void {
    this.skillIds.push(id);
  }

  async createPath(
    status: ContentStatus = ContentStatus.DRAFT,
  ): Promise<{ id: string; slug: string }> {
    const suffix = uniqueSuffix();
    const path = await this.db().learningPath.create({
      data: { title: `E2E Yo'l ${suffix}`, slug: `e2e-path-${suffix}`, status },
      select: { id: true, slug: true },
    });
    this.trackPath(path.id);
    return path;
  }

  async createSection(pathId: string, options: NodeOptions = {}): Promise<string> {
    const row = await this.db().pathSection.create({
      data: { pathId, title: "E2E bo'lim", ...this.node(options) },
      select: { id: true },
    });
    return row.id;
  }

  async createTopic(sectionId: string, options: NodeOptions = {}): Promise<string> {
    const row = await this.db().topic.create({
      data: { sectionId, title: 'E2E mavzu', ...this.node(options) },
      select: { id: true },
    });
    return row.id;
  }

  async createLesson(topicId: string, options: NodeOptions = {}): Promise<string> {
    const row = await this.db().lesson.create({
      data: { topicId, title: 'E2E dars', contentMd: '', ...this.node(options) },
      select: { id: true },
    });
    return row.id;
  }

  async createChest(sectionId: string, afterTopicId: string): Promise<string> {
    const row = await this.db().pathChest.create({
      data: { sectionId, afterTopicId, title: 'E2E sandiq', reward: { ...TEST_REWARD } },
      select: { id: true },
    });
    return row.id;
  }

  async createSkill(): Promise<{ id: string; name: string }> {
    const skill = await this.db().skill.create({
      data: { name: `E2E-${uniqueSuffix()}` },
      select: { id: true, name: true },
    });
    this.trackSkill(skill.id);
    return skill;
  }

  /** Yo'l → bo'lim → 3 mavzu (`order` 1…3), har birida bitta dars; barchasi `DRAFT`. */
  async createTree(): Promise<TestTree> {
    const { id: pathId } = await this.createPath();
    const sectionId = await this.createSection(pathId);
    const topicIds: string[] = [];
    const lessonIds: string[] = [];
    for (let order = 1; order <= TREE_TOPICS; order += 1) {
      const topicId = await this.createTopic(sectionId, { order });
      topicIds.push(topicId);
      lessonIds.push(await this.createLesson(topicId));
    }
    return {
      pathId,
      sectionId,
      topicIds: topicIds as TestTree['topicIds'],
      lessonIds: lessonIds as TestTree['lessonIds'],
    };
  }

  /** Studentning dars progressi (3.3 gacha API yo'q — to'g'ridan-to'g'ri yozuv). */
  async addLessonProgress(studentId: string, lessonId: string): Promise<void> {
    await this.db().lessonProgress.create({
      data: { studentId, lessonId, status: 'IN_PROGRESS' },
    });
  }

  /** Studentning mavzu progressi (dars progressisiz; 3.3 gacha API yo'q — to'g'ridan-to'g'ri yozuv). */
  async addTopicProgress(studentId: string, topicId: string): Promise<void> {
    await this.db().topicProgress.create({
      data: { studentId, topicId, status: 'AVAILABLE' },
    });
  }

  /** Redis'dagi kontent versiyasi (`content:path:{id}:ver`), yo'q bo'lsa — 0. */
  async version(pathId: string): Promise<number> {
    return Number((await this.app.get(RedisService).get(contentVersionKey(pathId))) ?? 0);
  }

  private node({ status = ContentStatus.DRAFT, order = 1 }: NodeOptions): {
    status: ContentStatus;
    order: number;
  } {
    return { status, order };
  }

  private db(): PrismaClient {
    return this.app.get(PrismaService).dbIncludingDeleted;
  }
}
