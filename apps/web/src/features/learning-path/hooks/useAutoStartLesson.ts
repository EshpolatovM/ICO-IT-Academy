'use client';

import { useEffect, useRef } from 'react';

import { LessonStatus } from '../types/learning-path.types';

import { useStartLesson } from './useLessonMutations';

import type { StudentLesson } from '../types/learning-path.types';

/** M-6: `AVAILABLE` dars sahifasi ochilganda u bir marta avtomatik boshlanadi. */
export function useAutoStartLesson(lesson: Pick<StudentLesson, 'id' | 'status'>) {
  const start = useStartLesson(lesson.id);
  const { mutate } = start;
  const requested = useRef(false);

  useEffect(() => {
    if (lesson.status === LessonStatus.AVAILABLE && !requested.current) {
      requested.current = true;
      mutate();
    }
  }, [lesson.status, mutate]);

  return start;
}
