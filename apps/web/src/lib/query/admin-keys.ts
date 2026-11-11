/** Boshqariladigan foydalanuvchilar turi (sahifa): `/admin/students`, `/admin/mentors`, `/admin/admins`. */
export type ManagedUserKind = 'students' | 'mentors' | 'admins';

/**
 * TanStack Query kalitlari: admin foydalanuvchilar. Feature'lardan tashqarida turadi, chunki
 * admin-groups ham (a'zolik o'zgarganda) ularni invalidate qiladi — features orasida sikl bo'lmasin.
 * Vaqtinchalik parollar (yaratish, tiklash, import javoblari) bu keshga HECH QACHON yozilmaydi.
 */
export const adminUsersKeys = {
  all: ['admin-users'] as const,
  kind: (kind: ManagedUserKind) => ['admin-users', kind] as const,
  list: (kind: ManagedUserKind, query: string) => ['admin-users', kind, 'list', query] as const,
  detail: (kind: ManagedUserKind, id: string) => ['admin-users', kind, 'detail', id] as const,
};
