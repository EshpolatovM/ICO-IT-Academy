import type { ManagedUserBase, PaginatedResult, UserSort, UserStatus } from '@lms/shared';

import type { ReactNode } from 'react';

/** Boshqariladigan foydalanuvchilar turi (sahifa): `/admin/students`, `/admin/mentors`, `/admin/admins`. */
export type ManagedUserKind = 'students' | 'mentors' | 'admins';

/** Jadval holati — URL query'da saqlanadi (docs/12 §2.1 ro'yxat parametrlari). */
export interface UserListState {
  page: number;
  pageSize: number;
  /** Qidiruv satri; bo'sh — qidiruvsiz. */
  q: string;
  status: UserStatus | undefined;
  sort: UserSort;
  /** Faqat studentlar: guruh filtri (2.3 dan keyin ulanadi). */
  groupId: string | undefined;
}

/** Saralanadigan ustunlar (`sort` qiymatining `-` siz qismi). */
export type UserSortField = 'createdAt' | 'lastName';

/** Ro'yxat jadvalining bitta ustuni. */
export interface UserListColumn<T extends ManagedUserBase> {
  key: string;
  header: string;
  sortField?: UserSortField;
  render: (item: T) => ReactNode;
}

/** Ro'yxatni yuklovchi funksiya (`GET` + query satri). */
export type UserListFetcher<T> = (query: URLSearchParams) => Promise<PaginatedResult<T>>;
