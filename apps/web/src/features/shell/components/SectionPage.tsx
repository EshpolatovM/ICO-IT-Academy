import { ComingSoon } from './ComingSoon';
import { SuperAdminOnly } from './SuperAdminOnly';

import type { NavEntry } from '../types/nav.types';

/**
 * Menyudagi hali qilinmagan bo'lim sahifasi ("Tez orada"). Super admin bandini oddiy admin
 * ochsa — 403 holati (backend ham ruxsat bermaydi).
 */
export function SectionPage({ entry }: { entry: NavEntry }) {
  const page = <ComingSoon title={entry.label} />;
  return entry.superAdminOnly === true ? <SuperAdminOnly>{page}</SuperAdminOnly> : page;
}
