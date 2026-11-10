import { Text, TopBar } from '@/components/ui';

import type { ReactNode } from 'react';

export interface ShellTopBarProps {
  /** Panel nomi (masalan "Mentor paneli"). */
  title: string;
  /** O'ng tomon: foydalanuvchi ismi, "Chiqish" (streak/XP/coin — 5-bosqichda). */
  end: ReactNode;
}

/** Rol panellarining yuqori paneli. */
export function ShellTopBar({ title, end }: ShellTopBarProps) {
  return (
    <TopBar
      start={
        <>
          <Text as="span" className="font-semibold">
            ICO IT Academy
          </Text>
          <Text as="span" variant="muted">
            {title}
          </Text>
        </>
      }
      end={end}
    />
  );
}
