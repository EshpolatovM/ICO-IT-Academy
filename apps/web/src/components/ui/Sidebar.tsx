import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface SidebarProps {
  /** Navigatsiya uchun ekran o'quvchi nomi. */
  label?: string;
  children: ReactNode;
  className?: string;
}

/** Yon panel (navigatsiya ro'yxati). Ichiga `NavItem` lar qo'yiladi. */
export function Sidebar({ label = 'Asosiy navigatsiya', children, className }: SidebarProps) {
  return (
    <nav
      aria-label={label}
      className={cn('h-full w-64 border-r border-border bg-surface p-3', className)}
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </nav>
  );
}
