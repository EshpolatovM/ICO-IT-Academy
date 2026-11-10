'use client';

import { Button } from '@/components/ui';

import { useLogout } from '../hooks/useLogout';

/** "Chiqish" tugmasi (akkauntli rollar). */
export function LogoutButton() {
  const logout = useLogout();
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
