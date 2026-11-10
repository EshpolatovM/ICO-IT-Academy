'use client';

import { usePathname } from 'next/navigation';

import { Role } from '@lms/shared';

import { NavItem } from '@/components/ui';
import { useCurrentUser } from '@/features/auth';

import { isNavEntryActive } from '../lib/nav-sections';

import { DisabledNavItem } from './DisabledNavItem';

import type { NavEntry } from '../types/nav.types';

export interface SidebarNavProps {
  entries: readonly NavEntry[];
  homePath: string;
}

/** Rol menyusi: joriy sahifa ajratiladi, super admin bandlari faqat super admin'ga ko'rinadi. */
export function SidebarNav({ entries, homePath }: SidebarNavProps) {
  const pathname = usePathname();
  const isSuperAdmin = useCurrentUser()?.role === Role.SUPER_ADMIN;
  const visible = entries.filter((entry) => entry.superAdminOnly !== true || isSuperAdmin);

  return (
    <>
      {visible.map((entry) =>
        entry.href === undefined ? (
          <DisabledNavItem key={entry.label} label={entry.label} />
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
