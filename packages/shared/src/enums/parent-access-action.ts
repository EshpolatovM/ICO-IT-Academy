/** `parent_access_logs.action` (docs/11 §1): token almashtirish va ko'rish. */
export const ParentAccessAction = {
  EXCHANGE: 'EXCHANGE',
  VIEW: 'VIEW',
} as const;

export type ParentAccessAction = (typeof ParentAccessAction)[keyof typeof ParentAccessAction];
