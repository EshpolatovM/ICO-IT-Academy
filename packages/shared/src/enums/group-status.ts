/** Guruh holati (docs/11 §2: `groups.status`). ARCHIVED — tugagan guruh: a'zo qo'shilmaydi, mentor scope'iga kirmaydi. */
export const GroupStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export type GroupStatus = (typeof GroupStatus)[keyof typeof GroupStatus];
