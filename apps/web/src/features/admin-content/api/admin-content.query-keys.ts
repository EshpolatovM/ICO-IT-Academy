/** TanStack Query kalitlari: admin kontent. Har bir mutatsiyadan keyin butun prefiks yangilanadi. */
export const adminContentKeys = {
  all: ['admin-content'] as const,
  paths: () => ['admin-content', 'paths'] as const,
  tree: (pathId: string) => ['admin-content', 'trees', pathId] as const,
  lesson: (lessonId: string) => ['admin-content', 'lessons', lessonId] as const,
};
