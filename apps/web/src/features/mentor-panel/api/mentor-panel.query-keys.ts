/**
 * TanStack Query kalitlari: mentor paneli. Vaqtinchalik parol va ota-ona tokeni/havolasi bu
 * keshga HECH QACHON yozilmaydi (`useSecretMutation`).
 */
export const mentorPanelKeys = {
  all: ['mentor-panel'] as const,
  groups: () => ['mentor-panel', 'groups'] as const,
  group: (id: string) => ['mentor-panel', 'groups', id] as const,
  groupStudents: (id: string) => ['mentor-panel', 'groups', id, 'students'] as const,
  /** Student profili va unga tegishli hamma narsa (tokenlar ham) — shu prefiks ostida. */
  student: (id: string) => ['mentor-panel', 'students', id] as const,
  parentTokens: (studentId: string) =>
    ['mentor-panel', 'students', studentId, 'parent-tokens'] as const,
};
