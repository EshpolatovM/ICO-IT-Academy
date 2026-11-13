import { itemPath } from '@/lib/api';

/** Student ilm yo'li endpointlari (docs/tasks/03-3.3-student-api.md §2.1), prefiks `/api/v1` — api client'da. */
const STUDENT_PATH = '/student/path';
const STUDENT_TOPICS = '/student/topics';
const STUDENT_LESSONS = '/student/lessons';

export const LearningPathEndpoint = {
  map: () => STUDENT_PATH,
  topic: (topicId: string) => itemPath(STUDENT_TOPICS, topicId),
  lesson: (lessonId: string) => itemPath(STUDENT_LESSONS, lessonId),
  lessonStart: (lessonId: string) => `${itemPath(STUDENT_LESSONS, lessonId)}/start`,
  lessonComplete: (lessonId: string) => `${itemPath(STUDENT_LESSONS, lessonId)}/complete`,
};
