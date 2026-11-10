import { cn } from '@/lib/cn';

import { MenuToggleButton } from './MenuToggleButton';

import type { ReactNode } from 'react';

export interface TopBarProps {
  /** Chap tomon: logotip yoki sahifa nomi. */
  start?: ReactNode;
  /** O'ng tomon: streak, XP, coin, bildirishnomalar, profil (keyingi modullarda). */
  end?: ReactNode;
  className?: string;
}

/** Yuqori panel karkasi. Yon panelli `AppShell` ichida mobil menyu tugmasi avtomatik qo'shiladi. */
export function TopBar({ start, end, className }: TopBarProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between gap-4 border-b border-border bg-bg px-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <MenuToggleButton />
        {start}
      </div>
      <div className="flex items-center gap-2">{end}</div>
    </header>
  );
}
