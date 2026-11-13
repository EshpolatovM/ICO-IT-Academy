import { Injectable } from '@nestjs/common';

import { ContentStatus } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';
import type { VisiblePath, VisibleSection } from '../learning.types.js';

const PUBLISHED = ContentStatus.PUBLISHED;

/** `order` bo'yicha (teng bo'lsa — `id`). */
function byOrder(): [{ order: 'asc' }, { id: 'asc' }] {
  return [{ order: 'asc' }, { id: 'asc' }];
}

/** Ko'rinadigan mavzu: o'zi `PUBLISHED` va kamida bitta ko'rinadigan darsi bor (3.3 §4.2, T-2). */
const VISIBLE_TOPIC_WHERE = {
  status: PUBLISHED,
  lessons: { some: { status: PUBLISHED } },
} as const satisfies Prisma.TopicWhereInput;

const TOPIC_SELECT = {
  id: true,
  sectionId: true,
  title: true,
  description: true,
  icon: true,
  skills: {
    orderBy: { skill: { name: 'asc' } },
    select: { skill: { select: { id: true, name: true, icon: true } } },
  },
  lessons: {
    where: { status: PUBLISHED },
    orderBy: byOrder(),
    select: { id: true, title: true, estMinutes: true },
  },
} as const satisfies Prisma.TopicSelect;

const SECTION_SELECT = {
  id: true,
  title: true,
  topics: { where: VISIBLE_TOPIC_WHERE, orderBy: byOrder(), select: TOPIC_SELECT },
  chests: {
    where: { afterTopic: VISIBLE_TOPIC_WHERE },
    orderBy: { id: 'asc' },
    select: { id: true, title: true, afterTopicId: true },
  },
} as const satisfies Prisma.PathSectionSelect;

type SectionRow = Prisma.PathSectionGetPayload<{ select: typeof SECTION_SELECT }>;

function toSection({ topics, ...section }: SectionRow): VisibleSection {
  return {
    ...section,
    topics: topics.map(({ skills, ...topic }) => ({
      ...topic,
      skills: skills.map(({ skill }) => skill),
    })),
  };
}

/**
 * Yo'lning ko'rinadigan tuzilmasi bitta so'rovda (3.3 §3.4): `PUBLISHED` yo'l → `PUBLISHED`
 * bo'limlar → ko'rinadigan mavzular → `PUBLISHED` darslar (`contentMd` siz) + sandiqlar. Ko'rinish
 * filtri so'rovning o'zida (docs/01 §3.2 p.4); mavzusiz bo'lim ham so'rovda chiqariladi.
 */
@Injectable()
export class VisiblePathRepository {
  constructor(private readonly prisma: PrismaService) {}

  async load(pathId: string): Promise<VisiblePath | null> {
    const row = await this.prisma.client.learningPath.findFirst({
      where: { id: pathId, status: PUBLISHED },
      select: {
        id: true,
        title: true,
        sections: {
          where: { status: PUBLISHED, topics: { some: VISIBLE_TOPIC_WHERE } },
          orderBy: byOrder(),
          select: SECTION_SELECT,
        },
      },
    });
    return row ? { ...row, sections: row.sections.map(toSection) } : null;
  }
}
