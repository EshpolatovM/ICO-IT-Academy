'use client';

import { useQuery } from '@tanstack/react-query';

import { learningPathApi } from '../api/learning-path.api';
import { learningPathKeys } from '../api/learning-path.query-keys';

/** `GET /student/path` — butun xarita bitta so'rovda. */
export function usePathMap() {
  return useQuery({
    queryKey: learningPathKeys.map(),
    queryFn: () => learningPathApi.getPathMap(),
  });
}

/** `GET /student/topics/:id` (qulflangan — 403 `LOCKED`, ko'rinmaydigan — 404). */
export function useTopic(topicId: string) {
  return useQuery({
    queryKey: learningPathKeys.topic(topicId),
    queryFn: () => learningPathApi.getTopic(topicId),
  });
}

/** `GET /student/lessons/:id` (yon ta'sirsiz). */
export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: learningPathKeys.lesson(lessonId),
    queryFn: () => learningPathApi.getLesson(lessonId),
  });
}
