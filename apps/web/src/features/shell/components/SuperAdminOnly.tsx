'use client';

import { Role } from '@lms/shared';

import { EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';

import type { ReactNode } from 'react';

/**
 * Faqat super admin uchun bo'lim (docs/03 §4.1). Oddiy admin ochsa — 403 holati ("Ruxsat yo'q");
 * haqiqiy himoya backend'da (RBAC).
 */
export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  if (user?.role !== Role.SUPER_ADMIN) {
    return <EmptyState title="Ruxsat yo'q" description="Bu bo'lim faqat super admin uchun." />;
  }
  return <>{children}</>;
}
