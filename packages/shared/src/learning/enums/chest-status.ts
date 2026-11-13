/** Xaritadagi sandiq holati (3.3 §2.3, TL Q-8). `OPENED` — 5-modulda (`chest_openings`). */
export const ChestStatus = {
  LOCKED: 'LOCKED',
  READY: 'READY',
  OPENED: 'OPENED',
} as const;

export type ChestStatus = (typeof ChestStatus)[keyof typeof ChestStatus];
