'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { learningPathApi } from '../api/learning-path.api';
import { learningPathKeys } from '../api/learning-path.query-keys';

/** Progress o'zgargach xarita, mavzu va dars so'rovlari qayta yuklanadi. */
function useInvalidateLearningPath() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: learningPathKeys.all });
}

/** `POST /student/lessons/:id/start` (idempotent). */
export function useStartLesson(lessonId: string) {
  const invalidate = useInvalidateLearningPath();
  return useMutation({
    mutationFn: () => learningPathApi.startLesson(lessonId),
    onSuccess: invalidate,
  });
}

/** `POST /student/lessons/:id/complete` (idempotent; javobda `next`). */
export function useCompleteLesson(lessonId: string) {
  const invalidate = useInvalidateLearningPath();
  return useMutation({
    mutationFn: () => learningPathApi.completeLesson(lessonId),
    onSuccess: invalidate,
  });
}
