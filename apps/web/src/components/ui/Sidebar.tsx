import { cn } from '@/lib/cn';

import type { ReactNode } from 'react';

export interface SidebarProps {
  /** Navigatsiya uchun ekran o'quvchi nomi. */
  label?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Yon panel (navigatsiya ro'yxati). Ichiga `NavItem` lar qo'yiladi.
 * Mobil menyu panelida (`AppShell`) to'liq kenglikda, `md` dan boshlab 256px ustun.
 */
export function Sidebar({ label = 'Asosiy navigatsiya', children, className }: SidebarProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        'h-full w-full border-border bg-bg p-3 md:w-64 md:border-r md:bg-surface',
        className,
      )}
    >
      <ul className="flex flex-col gap-1">{children}</ul>
    </nav>
  );
}
