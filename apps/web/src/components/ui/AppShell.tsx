import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface AppShellProps {
  /** Yuqori panel (odatda `TopBar`). */
  topBar?: ReactNode;
  /** Yon panel (odatda `Sidebar`). */
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Rol panellari uchun bo'sh karkas: yuqori panel + yon panel + asosiy kontent. */
export function AppShell({ topBar, sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-surface', className)}>
      {topBar}
      <div className="flex flex-1">
        {sidebar !== undefined ? <aside className="shrink-0">{sidebar}</aside> : null}
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
