'use client';

import { Button } from '@/components/ui';

import { useParentLogout } from '../hooks/useParentLogout';

/** Ota-ona "Chiqish" tugmasi (yagona mutatsiya — exchange'dan tashqari). */
export function ParentLogoutButton() {
  const logout = useParentLogout();
  return (
    <Button
      variant="ghost"
      size="sm"
      loading={logout.isPending}
      onClick={() => {
        logout.mutate();
      }}
    >
      Chiqish
    </Button>
  );
}
