/**
 * Dars holati (API, 3.3 §2.3). Prisma `LessonProgressStatus` (`IN_PROGRESS`, `COMPLETED`) uning
 * qism to'plami; `LOCKED`/`AVAILABLE` hisoblanadi.
 */
export const LessonStatus = {
  LOCKED: 'LOCKED',
  AVAILABLE: 'AVAILABLE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type LessonStatus = (typeof LessonStatus)[keyof typeof LessonStatus];
