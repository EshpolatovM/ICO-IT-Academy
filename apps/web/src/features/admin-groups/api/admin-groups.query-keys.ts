/** TanStack Query kalitlari: admin guruhlar, yo'llar va tanlov (Combobox) qidiruvlari. */
export const adminGroupsKeys = {
  all: ['admin-groups'] as const,
  lists: () => ['admin-groups', 'list'] as const,
  list: (query: string) => ['admin-groups', 'list', query] as const,
  detail: (id: string) => ['admin-groups', 'detail', id] as const,
  paths: () => ['admin-groups', 'paths'] as const,
  mentorOptions: (q: string) => ['admin-groups', 'mentor-options', q] as const,
  mentorOption: (id: string) => ['admin-groups', 'mentor-option', id] as const,
  /** Barcha student variantlari (a'zolik o'zgarsa — "guruhida" tavsifi eskiradi). */
  allStudentOptions: () => ['admin-groups', 'student-options'] as const,
  /** Guruhga qo'shish variantlari: shu guruh a'zolarisiz. */
  studentOptions: (groupId: string, q: string) =>
    ['admin-groups', 'student-options', groupId, q] as const,
  groupOptions: (q: string) => ['admin-groups', 'group-options', q] as const,
  groupOption: (id: string) => ['admin-groups', 'group-option', id] as const,
};
