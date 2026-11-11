'use client';

import { AppShell, Sidebar } from '@/components/ui';
import { ParentAccessGate, ParentChildrenNav, ParentLogoutButton } from '@/features/parent-access';

import { ShellTopBar } from './ShellTopBar';

import type { ReactNode } from 'react';

const TITLE = 'Ota-ona paneli';

/** `ParentLayout` (docs/03 §0): farzand tanlash va read-only bo'limlar; sessiyasiz — kod formasi. */
export function ParentLayout({ children }: { children: ReactNode }) {
  return (
    <ParentAccessGate>
      <AppShell
        topBar={<ShellTopBar title={TITLE} end={<ParentLogoutButton />} />}
        sidebar={
          <Sidebar label={`${TITLE}: farzandlar`}>
            <ParentChildrenNav />
          </Sidebar>
        }
      >
        {children}
      </AppShell>
    </ParentAccessGate>
  );
}
