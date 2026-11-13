import { apiRequest } from '@/lib/api';

import { LearningPathEndpoint } from './learning-path.endpoints';

import type {
  LearningPathApi,
  LessonCompleteResponse,
  LessonStartResponse,
  StudentLesson,
  StudentPathMap,
  StudentTopicDetail,
} from '../types/learning-path.types';

/** Haqiqiy backend (3.3) implementatsiyasi. Hammasi `@Roles(STUDENT)`, scope — tokendagi student. */
export const learningPathHttpApi: LearningPathApi = {
  getPathMap: () => apiRequest<StudentPathMap>(LearningPathEndpoint.map()),

  getTopic: (topicId) => apiRequest<StudentTopicDetail>(LearningPathEndpoint.topic(topicId)),

  getLesson: (lessonId) => apiRequest<StudentLesson>(LearningPathEndpoint.lesson(lessonId)),

  startLesson: (lessonId) =>
    apiRequest<LessonStartResponse>(LearningPathEndpoint.lessonStart(lessonId), {
      method: 'POST',
    }),

  completeLesson: (lessonId) =>
    apiRequest<LessonCompleteResponse>(LearningPathEndpoint.lessonComplete(lessonId), {
      method: 'POST',
    }),
};
