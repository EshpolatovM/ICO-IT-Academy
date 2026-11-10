import { Role } from '@lms/shared';

import { ROLE_HOME_PATH } from '@/features/auth';

import { ADMIN_NAV, MENTOR_NAV, STUDENT_NAV } from '../config/nav.config';

import { RoleShell } from './RoleShell';

import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

/** `StudentLayout` (docs/03 §0). Yuqori paneldagi streak/XP/coin/bildirishnomalar — 5-bosqichda. */
export function StudentLayout({ children }: LayoutProps) {
  return (
    <RoleShell
      zone="student"
      title="Student"
      nav={STUDENT_NAV}
      homePath={ROLE_HOME_PATH[Role.STUDENT]}
    >
      {children}
    </RoleShell>
  );
}

/** `MentorLayout` (docs/03 §0). */
export function MentorLayout({ children }: LayoutProps) {
  return (
    <RoleShell
      zone="mentor"
      title="Mentor paneli"
      nav={MENTOR_NAV}
      homePath={ROLE_HOME_PATH[Role.MENTOR]}
    >
      {children}
    </RoleShell>
  );
}

/** `AdminLayout` (docs/03 §0): admin va super admin; super admin bandlari faqat unga ko'rinadi. */
export function AdminLayout({ children }: LayoutProps) {
  return (
    <RoleShell
      zone="admin"
      title="Admin paneli"
      nav={ADMIN_NAV}
      homePath={ROLE_HOME_PATH[Role.ADMIN]}
    >
      {children}
    </RoleShell>
  );
}
