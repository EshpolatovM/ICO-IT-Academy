import { HttpStatus } from '@nestjs/common';

import type { AdminPathTree, AdminSectionNode, AdminTopicNode } from '@lms/shared';

import { PrismaService } from '../../src/infra/prisma/prisma.service.js';

import { ContentFixtures } from './content-fixtures.js';
import { useAdminSession } from './group-api.js';

import type { E2eContext } from './e2e-context.js';
import type { RoleSession } from './group-api.js';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

export interface ContentSuite {
  admin: RoleSession;
  content: ContentFixtures;
}

/** `describe` ichida: admin sessiyasi va kontent fixture'lari (qiymatlar testlar ichida o'qiladi). */
export function useContentSuite(context: E2eContext): ContentSuite {
  const admin = useAdminSession(context);
  const suite = { admin } as ContentSuite;
  beforeAll(() => {
    suite.content = new ContentFixtures(context.app, context.fixtures);
  });
  return suite;
}

/** Admin daraxti (`GET /admin/paths/:id/tree`, 200). */
export async function treeOf(admin: RoleSession, pathId: string): Promise<AdminPathTree> {
  const response = await admin.api.get(`/admin/paths/${pathId}/tree`).expect(HttpStatus.OK);
  return response.body as AdminPathTree;
}

/** Daraxtdagi bo'lim (id bo'yicha). */
export function sectionIn(tree: AdminPathTree, sectionId: string): AdminSectionNode | undefined {
  return tree.sections.find((section) => section.id === sectionId);
}

/** Daraxtdagi mavzu (id bo'yicha). */
export function topicIn(tree: AdminPathTree, topicId: string): AdminTopicNode | undefined {
  return tree.sections.flatMap((section) => section.topics).find((topic) => topic.id === topicId);
}

export interface ContentAuditRow {
  action: string;
  entityType: string;
  before: unknown;
  after: unknown;
}

/** Obyekt bo'yicha audit yozuvlari (eskidan yangiga). */
export function contentAuditRows(
  app: INestApplication<App>,
  entityId: string,
): Promise<ContentAuditRow[]> {
  return app.get(PrismaService).db.auditLog.findMany({
    where: { entityId },
    orderBy: { id: 'asc' },
    select: { action: true, entityType: true, before: true, after: true },
  });
}
