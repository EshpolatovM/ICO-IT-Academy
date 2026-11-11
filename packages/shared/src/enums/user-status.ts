/** Foydalanuvchi holati (docs/11 §1: `users.status`). INACTIVE — deaktivatsiya qilingan, kira olmaydi. */
export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
