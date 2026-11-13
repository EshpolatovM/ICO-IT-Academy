/**
 * Mavzu holati (docs/05 §2.1, 3.3 §2.3). Prisma `TopicStatus` bilan bir xil qiymatlar; `LOCKED`
 * bazaga yozilmaydi (docs/11:228) — faqat hisoblanadi.
 */
export const TopicStatus = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type TopicStatus = (typeof TopicStatus)[keyof typeof TopicStatus];
