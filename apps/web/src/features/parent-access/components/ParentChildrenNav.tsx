'use client';

import { usePathname } from 'next/navigation';

import { PARENT_LINK_PATH } from '@lms/shared';

import { NavItem } from '@/components/ui';

import { useParentChildren } from '../hooks/useParentChildren';

/** Yon menyu: "Farzandlar" va har bir farzand (farzand tanlash, docs/03 §0 `ParentLayout`). */
export function ParentChildrenNav() {
  const pathname = usePathname();
  const { data: children = [] } = useParentChildren();
  return (
    <>
      <NavItem href={PARENT_LINK_PATH} active={pathname === PARENT_LINK_PATH}>
        Farzandlar
      </NavItem>
      {children.map((child) => {
        const href = `${PARENT_LINK_PATH}/${child.studentId}`;
        return (
          <NavItem key={child.studentId} href={href} active={pathname.startsWith(href)}>
            {child.firstName} {child.lastName}
          </NavItem>
        );
      })}
    </>
  );
}
