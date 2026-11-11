'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button, Stack } from '@/components/ui';

import { AdminUsersPath } from '../lib/admin-users-paths';

/** "Foydalanuvchilar" bo'limi ichidagi sahifalar (docs/03 §4: Studentlar, Mentorlar). */
const USER_SECTIONS = [
  { href: AdminUsersPath.STUDENTS, label: 'Studentlar' },
  { href: AdminUsersPath.MENTORS, label: 'Mentorlar' },
] as const;

/** Studentlar ↔ Mentorlar o'tish havolalari. */
export function UsersSectionNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Foydalanuvchilar bo'limlari">
      <Stack direction="horizontal" gap="2">
        {USER_SECTIONS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Button key={href} asChild size="sm" variant={active ? 'primary' : 'secondary'}>
              <Link href={href} aria-current={active ? 'page' : undefined}>
                {label}
              </Link>
            </Button>
          );
        })}
      </Stack>
    </nav>
  );
}
