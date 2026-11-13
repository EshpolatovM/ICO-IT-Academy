import type {
  AdminChestNode,
  AdminLesson,
  AdminPathDetail,
  AdminPathItem,
  SkillItem,
} from '@lms/shared';

import type {
  ChestRecord,
  LessonDetailRecord,
  PathItemRecord,
  PathRecord,
  SkillRecord,
} from '../content.types.js';

export function toAdminPathItem(record: PathItemRecord): AdminPathItem {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    status: record.status,
    description: record.description,
    updatedAt: record.updatedAt.toISOString(),
    sectionsCount: record.sectionsCount,
    topicsCount: record.topicsCount,
  };
}

export function toAdminPathDetail(record: PathRecord): AdminPathDetail {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    groupsCount: record.groupsCount,
  };
}

export function toAdminLesson(record: LessonDetailRecord): AdminLesson {
  return {
    id: record.id,
    order: record.order,
    title: record.title,
    contentMd: record.contentMd,
    videoUrl: record.videoUrl,
    estMinutes: record.estMinutes,
    status: record.status,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    topic: record.topic,
    path: record.path,
  };
}

export function toChestNode(record: ChestRecord): AdminChestNode {
  return {
    id: record.id,
    title: record.title,
    afterTopicId: record.afterTopicId,
    reward: record.reward,
  };
}

export function toSkillItem(record: SkillRecord): SkillItem {
  return { id: record.id, name: record.name, icon: record.icon, topicsCount: record.topicsCount };
}
