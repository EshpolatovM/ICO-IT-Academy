import { mockDb, byOrder } from './admin-content.mock-store';

import type { MockLesson, MockPath, MockSection, MockTopic } from './admin-content.mock-data';
import type {
  AdminLesson,
  AdminLessonNode,
  AdminPathItem,
  AdminPathTree,
  AdminSectionNode,
  AdminTopicNode,
} from '../types/admin-content.types';

/** Soxta baza yozuvlari → API javob shakllari (§2.3). */

export function toLessonNode(lesson: MockLesson): AdminLessonNode {
  const { id, order, title, status, estMinutes, videoUrl } = lesson;
  return { id, order, title, status, estMinutes, hasVideo: videoUrl !== null };
}

export function toTopicNode(topic: MockTopic): AdminTopicNode {
  const { id, order, title, description, icon, status } = topic;
  const lessons = mockDb().lessons.filter((lesson) => lesson.topicId === id);
  return {
    id,
    order,
    title,
    description,
    icon,
    status,
    skills: [],
    lessons: byOrder(lessons).map(toLessonNode),
  };
}

export function toSectionNode(section: MockSection): AdminSectionNode {
  const { id, order, title, description, status } = section;
  const db = mockDb();
  const topics = db.topics.filter((topic) => topic.sectionId === id);
  return {
    id,
    order,
    title,
    description,
    status,
    topics: byOrder(topics).map(toTopicNode),
    chests: db.chests
      .filter((chest) => chest.sectionId === id)
      .map(({ sectionId: _sectionId, ...chest }) => chest),
  };
}

export function sectionsOfPath(pathId: string): MockSection[] {
  return byOrder(mockDb().sections.filter((section) => section.pathId === pathId));
}

export function toTree(path: MockPath): AdminPathTree {
  return { path, sections: sectionsOfPath(path.id).map(toSectionNode) };
}

export function toPathItem(path: MockPath): AdminPathItem {
  const { id, title, slug, status, description, updatedAt } = path;
  const sections = sectionsOfPath(id);
  const topicsCount = mockDb().topics.filter((topic) =>
    sections.some((section) => section.id === topic.sectionId),
  ).length;
  return {
    id,
    title,
    slug,
    status,
    description,
    updatedAt,
    sectionsCount: sections.length,
    topicsCount,
  };
}

export function toAdminLesson(lesson: MockLesson): AdminLesson {
  const db = mockDb();
  const topic = db.topics.find((item) => item.id === lesson.topicId);
  const section = db.sections.find((item) => item.id === topic?.sectionId);
  const path = db.paths.find((item) => item.id === section?.pathId);
  const { topicId: _topicId, ...rest } = lesson;
  return {
    ...rest,
    topic: { id: lesson.topicId, title: topic?.title ?? '' },
    path: { id: path?.id ?? '', title: path?.title ?? '' },
  };
}
