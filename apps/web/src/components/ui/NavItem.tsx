import Link from 'next/link';

import { cn } from '@/lib/cn';

import { focusRing } from './classes';

import type { ReactNode } from 'react';

interface NavItemBaseProps {
  /** Joriy sahifa — ajratib ko'rsatiladi va `aria-current="page"` oladi. */
  active?: boolean;
  /** Band yonidagi kichik izoh (masalan "Tez orada"). */
  hint?: string;
  children: ReactNode;
  className?: string;
}

interface NavItemLinkProps extends NavItemBaseProps {
  href: string;
  disabled?: false;
}

interface NavItemDisabledProps extends NavItemBaseProps {
  /** Bosilmaydigan band: havola emas, `aria-disabled="true"`. */
  disabled: true;
  href?: string;
}

export type NavItemProps = NavItemLinkProps | NavItemDisabledProps;

const itemBase = 'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm';

function NavItemHint({ hint }: { hint: string | undefined }) {
  if (hint === undefined) return null;
  return <span className="shrink-0 text-xs text-text-disabled">{hint}</span>;
}

/** `Sidebar` ichidagi navigatsiya bandi: havola yoki (`disabled`) bosilmaydigan matn. */
export function NavItem(props: NavItemProps) {
  const { active = false, hint, children, className } = props;

  if (props.disabled === true) {
    return (
      <li>
        <span
          aria-disabled="true"
          className={cn(itemBase, 'cursor-not-allowed text-text-disabled', className)}
        >
          <span className="min-w-0">{children}</span>
          <NavItemHint hint={hint} />
        </span>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={props.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          itemBase,
          focusRing,
          active ? 'bg-primary text-primary-fg' : 'text-text hover:bg-surface-muted',
          className,
        )}
      >
        <span className="min-w-0">{children}</span>
        <NavItemHint hint={hint} />
      </Link>
    </li>
  );
}
