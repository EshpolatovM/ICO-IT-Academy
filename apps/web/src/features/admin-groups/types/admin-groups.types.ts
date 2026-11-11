import type { GroupStatus } from '@lms/shared';

/** Guruhlar jadvali holati — URL query'da (docs/12 §2.2 ro'yxat parametrlari). */
export interface GroupListState {
  page: number;
  pageSize: number;
  /** Nom bo'yicha qidiruv; bo'sh — qidiruvsiz. */
  q: string;
  status: GroupStatus | undefined;
  pathId: string | undefined;
  mentorId: string | undefined;
}

/** Filtr/qidiruv/sahifa o'zgarishi (bittasi yoki bir nechtasi). */
export type GroupListPatch = Partial<GroupListState>;
