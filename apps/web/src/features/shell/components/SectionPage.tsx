'use client';

import { Role } from '@lms/shared';

import { EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';

import { ComingSoon } from './ComingSoon';

import type { NavEntry } from '../types/nav.types';

/**
 * Menyudagi hali qilinmagan bo'lim sahifasi ("Tez orada"). Super admin bandini oddiy admin
 * ochsa — 403 holati (backend ham ruxsat bermaydi).
 */
export function SectionPage({ entry }: { entry: NavEntry }) {
  const user = useCurrentUser();
  if (entry.superAdminOnly === true && user?.role !== Role.SUPER_ADMIN) {
    return <EmptyState title="Ruxsat yo'q" description="Bu bo'lim faqat super admin uchun." />;
  }
  return <ComingSoon title={entry.label} />;
}
