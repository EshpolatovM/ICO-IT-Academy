/** TanStack Query kalitlari: student ilm yo'li. Progress o'zgarsa butun prefiks yangilanadi. */
export const learningPathKeys = {
  all: ['learning-path'] as const,
  map: () => ['learning-path', 'map'] as const,
  topic: (topicId: string) => ['learning-path', 'topics', topicId] as const,
  lesson: (lessonId: string) => ['learning-path', 'lessons', lessonId] as const,
};
