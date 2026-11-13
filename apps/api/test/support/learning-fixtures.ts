import { HttpStatus } from '@nestjs/common';

import { ContentStatus, Role } from '@lms/shared';
import type { StudentPathMap, StudentTopicNode } from '@lms/shared';

import { PrismaService } from '../../src/infra/prisma/prisma.service.js';
import { ContentCacheVersion } from '../../src/modules/content/services/content-cache-version.service.js';

import { login } from './auth-fixtures.js';
import { apiAs } from './group-api.js';

import type { AuthFixtures, TestUser } from './auth-fixtures.js';
import type { ContentFixtures } from './content-fixtures.js';
import type { E2eContext } from './e2e-context.js';
import type { ApiClient } from './group-api.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

/** Tugunlar `order` qadami — orasiga yangi tugun qo'yish uchun (S-35 testlari). */
export const ORDER_STEP = 10;

export interface PublishedTopic {
  id: string;
  sectionId: string;
  lessonIds: string[];
}

export interface PublishedPath {
  pathId: string;
  sectionIds: string[];
  topics: PublishedTopic[];
}

/**
 * Butunlay `PUBLISHED` yo'l (to'g'ridan-to'g'ri bazaga): `layout` — bo'limlar, ichida har mavzuning
 * darslari soni (masalan `[[2, 1], [1]]`). `order` lar `ORDER_STEP` qadam bilan.
 */
export async function createPublishedPath(
  content: ContentFixtures,
  layout: readonly (readonly number[])[],
): Promise<PublishedPath> {
  const status = ContentStatus.PUBLISHED;
  const { id: pathId } = await content.createPath(status);
  const result: PublishedPath = { pathId, sectionIds: [], topics: [] };
  for (const [sectionIndex, topics] of layout.entries()) {
    const sectionId = await content.createSection(pathId, {
      status,
      order: (sectionIndex + 1) * ORDER_STEP,
    });
    result.sectionIds.push(sectionId);
    for (const [topicIndex, lessonCount] of topics.entries()) {
      const id = await content.createTopic(sectionId, {
        status,
        order: (topicIndex + 1) * ORDER_STEP,
      });
      const lessonIds: string[] = [];
      for (let order = 1; order <= lessonCount; order += 1) {
        lessonIds.push(await content.createLesson(id, { status, order: order * ORDER_STEP }));
      }
      result.topics.push({ id, sectionId, lessonIds });
    }
  }
  return result;
}

/** `PublishedPath` dagi mavzu (indeks bo'yicha) — testlarda qisqa yozish uchun. */
export function topicAt(path: PublishedPath, index: number): PublishedTopic {
  const topic = path.topics[index];
  if (!topic) {
    throw new Error(`Mavzu yo'q: ${String(index)}`);
  }
  return topic;
}

export function lessonAt(path: PublishedPath, topicIndex: number, lessonIndex: number): string {
  const lessonId = topicAt(path, topicIndex).lessonIds[lessonIndex];
  if (!lessonId) {
    throw new Error(`Dars yo'q: ${String(topicIndex)}/${String(lessonIndex)}`);
  }
  return lessonId;
}

export interface StudentSession {
  user: TestUser;
  api: ApiClient;
}

/** Yangi student (ixtiyoriy — yo'l guruhida faol a'zo) va uning nomidan klient. */
export async function studentSession(
  app: INestApplication<App>,
  fixtures: AuthFixtures,
  pathId?: string,
): Promise<StudentSession> {
  const user = await fixtures.createUser({ role: Role.STUDENT });
  if (pathId !== undefined) {
    await fixtures.createGroup({ pathId, studentIds: [user.id] });
  }
  return { user, api: apiAs(app, (await login(app, user)).accessToken) };
}

export async function pathMapOf(api: ApiClient): Promise<StudentPathMap> {
  return (await api.get('/student/path').expect(HttpStatus.OK)).body as StudentPathMap;
}

/** Xaritadagi mavzu tugunlari: id → holat. */
export function topicStatuses(map: StudentPathMap): Record<string, string> {
  return Object.fromEntries(topicNodes(map).map((node) => [node.id, node.status]));
}

export function topicNodes(map: StudentPathMap): StudentTopicNode[] {
  return map.sections.flatMap((section) =>
    section.nodes.filter((node): node is StudentTopicNode => node.kind === 'TOPIC'),
  );
}

/** Bazaga to'g'ridan-to'g'ri yozilgan kontent o'zgarishidan keyin versiyani oshiradi (3.2 kabi). */
export async function bumpContentVersion(
  app: INestApplication<App>,
  pathId: string,
): Promise<void> {
  await app.get(ContentCacheVersion).bump([pathId]);
}

/** Bazadagi enrollment'lar soni va `completed_at`. */
export function enrollmentsOf(app: INestApplication<App>, studentId: string) {
  return app.get(PrismaService).db.studentPathEnrollment.findMany({
    where: { studentId },
    select: { pathId: true, completedAt: true },
  });
}

export interface PathStudent extends StudentSession {
  path: PublishedPath;
}

/** Yangi nashr qilingan yo'l (`layout`) va uning guruhidagi yangi student. */
export async function studentOnNewPath(
  context: E2eContext,
  content: ContentFixtures,
  layout: readonly (readonly number[])[],
): Promise<PathStudent> {
  const path = await createPublishedPath(content, layout);
  return { path, ...(await studentSession(context.app, context.fixtures, path.pathId)) };
}
