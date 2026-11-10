'use client';

import { cn } from '@/lib/cn';

import { AppShellNavContext } from './AppShellContext';
import { useMobileNav } from './useMobileNav';

import type { ReactNode } from 'react';

export interface AppShellProps {
  /** Yuqori panel (odatda `TopBar`). Yon panel bo'lsa, `TopBar` ga mobil menyu tugmasi qo'shiladi. */
  topBar?: ReactNode;
  /** Yon panel (odatda `Sidebar`). `md` dan kichik ekranda menyu tugmasi orqali ochiladi. */
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Rol panellari uchun karkas: yuqori panel + yon panel + asosiy kontent.
 * Mobil (`md` dan kichik): yon panel yashirin, ochilganda kontent ustida panel bo'lib chiqadi.
 */
export function AppShell({ topBar, sidebar, children, className }: AppShellProps) {
  const { state, panelRef, onPanelClick, onPanelKeyDown } = useMobileNav();
  const hasSidebar = sidebar !== undefined;

  return (
    <AppShellNavContext.Provider value={hasSidebar ? state : null}>
      <div className={cn('flex min-h-screen flex-col bg-surface', className)}>
        {topBar}
        <div className="relative flex flex-1">
          {hasSidebar ? (
            <aside
              ref={panelRef}
              id={state.panelId}
              onClick={onPanelClick}
              onKeyDown={onPanelKeyDown}
              className={cn(
                'shrink-0 md:static md:block',
                state.open ? 'absolute inset-0 z-10 overflow-y-auto bg-bg' : 'hidden',
              )}
            >
              {sidebar}
            </aside>
          ) : null}
          <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AppShellNavContext.Provider>
  );
}
