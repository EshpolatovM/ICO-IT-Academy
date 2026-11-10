import Link from 'next/link';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';

import type { ReactNode } from 'react';

export interface NavItemProps {
  href: string;
  /** Joriy sahifa — ajratib ko'rsatiladi va `aria-current="page"` oladi. */
  active?: boolean;
  children: ReactNode;
  className?: string;
}

/** `Sidebar` ichidagi navigatsiya havolasi. */
export function NavItem({ href, active = false, children, className }: NavItemProps) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'block rounded-md px-3 py-2 text-sm',
          focusRing,
          active ? 'bg-primary text-primary-fg' : 'text-text hover:bg-surface-muted',
          className,
        )}
      >
        {children}
      </Link>
    </li>
  );
}
