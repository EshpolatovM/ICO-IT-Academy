'use client';

import { usePathname } from 'next/navigation';

import { Role } from '@lms/shared';

import { NavItem } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';

import { isNavEntryActive } from '../lib/nav-sections';

import type { NavEntry } from '../types/nav.types';

export interface SidebarNavProps {
  entries: readonly NavEntry[];
  homePath: string;
}

/** Yo'li hali aniqlanmagan band yonidagi izoh. */
const DISABLED_HINT = 'Tez orada';

/** Rol menyusi: joriy sahifa ajratiladi, super admin bandlari faqat super admin'ga ko'rinadi. */
export function SidebarNav({ entries, homePath }: SidebarNavProps) {
  const pathname = usePathname();
  const isSuperAdmin = useCurrentUser()?.role === Role.SUPER_ADMIN;
  const visible = entries.filter((entry) => entry.superAdminOnly !== true || isSuperAdmin);

  return (
    <>
      {visible.map((entry) =>
        entry.href === undefined ? (
          <NavItem key={entry.label} disabled hint={DISABLED_HINT}>
            {entry.label}
          </NavItem>
        ) : (
          <NavItem
            key={entry.href}
            href={entry.href}
            active={isNavEntryActive(entry, pathname, homePath)}
          >
            {entry.label}
          </NavItem>
        ),
      )}
    </>
  );
}
