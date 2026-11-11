/**
 * Platformadagi rollar (docs/01-rollar-va-ruxsatlar.md §1).
 * PARENT — virtual rol: akkaunti yo'q, token orqali faqat o'qish huquqi bilan kiradi.
 */
export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MENTOR: 'MENTOR',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];
