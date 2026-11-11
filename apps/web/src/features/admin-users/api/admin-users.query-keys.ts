import type { ManagedUserKind } from '../types/admin-users.types';

/**
 * TanStack Query kalitlari: admin foydalanuvchilar. Vaqtinchalik parollar (yaratish, tiklash,
 * import javoblari) bu keshga HECH QACHON yozilmaydi.
 */
export const adminUsersKeys = {
  all: ['admin-users'] as const,
  kind: (kind: ManagedUserKind) => ['admin-users', kind] as const,
  list: (kind: ManagedUserKind, query: string) => ['admin-users', kind, 'list', query] as const,
  detail: (kind: ManagedUserKind, id: string) => ['admin-users', kind, 'detail', id] as const,
};
