import { Injectable } from '@nestjs/common';

import { chestRewardSchema } from '@lms/shared';
import type { AdminSectionNode, AdminTopicNode } from '@lms/shared';

import { PrismaService } from '../../../infra/prisma/prisma.service.js';

import type { Prisma } from '../../../infra/prisma/generated/client.js';

/** `order` bo'yicha (teng bo'lsa — `id`). Funksiya: `as const` select ichida massiv o'zgaruvchan qolsin. */
function byOrder(): [{ order: 'asc' }, { id: 'asc' }] {
  return [{ order: 'asc' }, { id: 'asc' }];
}

/** Sandiqlar — ular turgan mavzu tartibida. */
function byAfterTopicOrder(): [{ afterTopic: { order: 'asc' } }, { id: 'asc' }] {
  return [{ afterTopic: { order: 'asc' } }, { id: 'asc' }];
}

const TOPIC_NODE_SELECT = {
  id: true,
  order: true,
  title: true,
  description: true,
  icon: true,
  status: true,
  skills: {
    orderBy: { skill: { name: 'asc' } },
    select: { skill: { select: { id: true, name: true, icon: true } } },
  },
  lessons: {
    orderBy: byOrder(),
    select: { id: true, order: true, title: true, status: true, estMinutes: true, videoUrl: true },
  },
} as const satisfies Prisma.TopicSelect;

const SECTION_NODE_SELECT = {
  id: true,
  order: true,
  title: true,
  description: true,
  status: true,
  topics: { orderBy: byOrder(), select: TOPIC_NODE_SELECT },
  chests: {
    orderBy: byAfterTopicOrder(),
    select: { id: true, title: true, afterTopicId: true, reward: true },
  },
} as const satisfies Prisma.PathSectionSelect;

type TopicRow = Prisma.TopicGetPayload<{ select: typeof TOPIC_NODE_SELECT }>;
type SectionRow = Prisma.PathSectionGetPayload<{ select: typeof SECTION_NODE_SELECT }>;

function toTopicNode({ skills, lessons, ...row }: TopicRow): AdminTopicNode {
  return {
    ...row,
    skills: skills.map(({ skill }) => skill),
    lessons: lessons.map(({ videoUrl, ...lesson }) => ({ ...lesson, hasVideo: videoUrl !== null })),
  };
}

function toSectionNode({ topics, chests, ...row }: SectionRow): AdminSectionNode {
  return {
    ...row,
    topics: topics.map(toTopicNode),
    chests: chests.map((chest) => ({ ...chest, reward: chestRewardSchema.parse(chest.reward) })),
  };
}

/**
 * Admin daraxti (3.2 §2.3): barcha holatlar, `order` bo'yicha; bitta so'rov + nested `include`
 * (N+1 yo'q). `contentMd` daraxtga kirmaydi. Bo'lim/mavzu mutatsiyalari javobi ham shu yerdan.
 */
@Injectable()
export class PathTreeRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Yo'l bo'limlari (to'liq daraxt); yo'l yo'q bo'lsa — `null`. */
  async findSections(pathId: string): Promise<AdminSectionNode[] | null> {
    const row = await this.prisma.client.learningPath.findUnique({
      where: { id: pathId },
      select: { sections: { orderBy: byOrder(), select: SECTION_NODE_SELECT } },
    });
    return row ? row.sections.map(toSectionNode) : null;
  }

  async findSection(id: string): Promise<AdminSectionNode | null> {
    const row = await this.prisma.client.pathSection.findUnique({
      where: { id },
      select: SECTION_NODE_SELECT,
    });
    return row ? toSectionNode(row) : null;
  }

  async findTopic(id: string): Promise<AdminTopicNode | null> {
    const row = await this.prisma.client.topic.findUnique({
      where: { id },
      select: TOPIC_NODE_SELECT,
    });
    return row ? toTopicNode(row) : null;
  }
}
