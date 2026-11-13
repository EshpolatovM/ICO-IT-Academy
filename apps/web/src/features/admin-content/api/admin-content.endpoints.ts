import { itemPath } from '@/lib/api';

/** Admin kontent endpointlari (docs/tasks/03-3.2 §2.1 = docs/12 §3), prefiks `/api/v1` — api client'da. */
const PATHS = '/admin/paths';
const SECTIONS = '/admin/sections';
const TOPICS = '/admin/topics';
const LESSONS = '/admin/lessons';
const CHESTS = '/admin/chests';

function child(base: string, id: string, suffix: string): string {
  return `${itemPath(base, id)}/${suffix}`;
}

export const AdminContentEndpoint = {
  paths: () => PATHS,
  path: (pathId: string) => itemPath(PATHS, pathId),
  pathPublish: (pathId: string) => child(PATHS, pathId, 'publish'),
  pathTree: (pathId: string) => child(PATHS, pathId, 'tree'),
  pathSections: (pathId: string) => child(PATHS, pathId, 'sections'),
  sectionsOrder: (pathId: string) => child(PATHS, pathId, 'sections/order'),
  section: (sectionId: string) => itemPath(SECTIONS, sectionId),
  sectionTopics: (sectionId: string) => child(SECTIONS, sectionId, 'topics'),
  topicsOrder: (sectionId: string) => child(SECTIONS, sectionId, 'topics/order'),
  sectionChests: (sectionId: string) => child(SECTIONS, sectionId, 'chests'),
  topic: (topicId: string) => itemPath(TOPICS, topicId),
  topicLessons: (topicId: string) => child(TOPICS, topicId, 'lessons'),
  lessonsOrder: (topicId: string) => child(TOPICS, topicId, 'lessons/order'),
  lesson: (lessonId: string) => itemPath(LESSONS, lessonId),
  chest: (chestId: string) => itemPath(CHESTS, chestId),
};
