'use client';

import { useAppShellNav } from './AppShellContext';
import { Button } from './Button';

/**
 * Mobil menyu tugmasi (`md` dan kichik ekranlarda). `TopBar` ichida avtomatik chiqadi —
 * faqat yon panelli `AppShell` ichida bo'lsa.
 */
export function MenuToggleButton() {
  const nav = useAppShellNav();
  if (nav === null) return null;

  return (
    <Button
      ref={nav.buttonRef}
      variant="secondary"
      size="sm"
      className="md:hidden"
      aria-expanded={nav.open}
      aria-controls={nav.panelId}
      onClick={nav.toggle}
    >
      {nav.open ? 'Yopish' : 'Menyu'}
    </Button>
  );
}
