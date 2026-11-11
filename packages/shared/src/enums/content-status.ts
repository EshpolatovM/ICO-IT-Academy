/** Kontent holati (docs/11 §3: `learning_paths.status` va boshqa kontent jadvallari). */
export const ContentStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ContentStatus = (typeof ContentStatus)[keyof typeof ContentStatus];
