import { Text, TopBar } from '@/components/ui';

import type { ReactNode } from 'react';

export interface ShellTopBarProps {
  /** Panel nomi (masalan "Mentor paneli"). */
  title: string;
  /** O'ng tomon: foydalanuvchi ismi, "Chiqish" (streak/XP/coin — 5-bosqichda). */
  end: ReactNode;
}

/**
 * Rol panellarining yuqori paneli. Mobil menyu tugmasini `TopBar` o'zi qo'shadi (`AppShell` ichida);
 * tor ekranda joy tejash uchun platforma nomi yashiriladi, panel nomi qisqartiriladi.
 */
export function ShellTopBar({ title, end }: ShellTopBarProps) {
  return (
    <TopBar
      start={
        <>
          <Text as="span" className="hidden font-semibold sm:inline">
            ICO IT Academy
          </Text>
          <Text as="span" variant="muted" className="truncate">
            {title}
          </Text>
        </>
      }
      end={end}
    />
  );
}
