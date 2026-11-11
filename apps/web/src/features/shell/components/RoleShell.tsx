'use client';

import { AppShell, Sidebar } from '@/components/ui';
import { AuthGuard, CurrentUserName, LogoutButton } from '@/features/auth';
import type { AccountZone } from '@/features/auth';

import { ShellTopBar } from './ShellTopBar';
import { SidebarNav } from './SidebarNav';

import type { NavEntry } from '../types/nav.types';
import type { ReactNode } from 'react';

export interface RoleShellProps {
  zone: AccountZone;
  title: string;
  nav: readonly NavEntry[];
  homePath: string;
  children: ReactNode;
}

/** Akkauntli rol paneli: route guard + `AppShell` (yuqori panel, yon menyu, kontent). */
export function RoleShell({ zone, title, nav, homePath, children }: RoleShellProps) {
  return (
    <AuthGuard area={zone}>
      <AppShell
        topBar={
          <ShellTopBar
            title={title}
            end={
              <>
                <CurrentUserName />
                <LogoutButton />
              </>
            }
          />
        }
        sidebar={
          <Sidebar label={`${title}: menyu`}>
            <SidebarNav entries={nav} homePath={homePath} />
          </Sidebar>
        }
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
