/** TanStack Query kalitlari: admin guruhlar, yo'llar va tanlov (Combobox) qidiruvlari. */
export const adminGroupsKeys = {
  all: ['admin-groups'] as const,
  lists: () => ['admin-groups', 'list'] as const,
  list: (query: string) => ['admin-groups', 'list', query] as const,
  detail: (id: string) => ['admin-groups', 'detail', id] as const,
  paths: () => ['admin-groups', 'paths'] as const,
  mentorOptions: (q: string) => ['admin-groups', 'mentor-options', q] as const,
  mentorOption: (id: string) => ['admin-groups', 'mentor-option', id] as const,
  studentOptions: (q: string) => ['admin-groups', 'student-options', q] as const,
};
