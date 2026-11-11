import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthUser } from '@lms/shared';

import { resetAuthStore, useAuthStore } from '@/stores/auth.store';

import { SuperAdminOnly } from './SuperAdminOnly';

function signIn(role: AuthUser['role']): void {
  useAuthStore.getState().setSession('token', {
    id: 'u1',
    role,
    firstName: 'Test',
    lastName: 'User',
    mustChangePassword: false,
  });
}

describe('SuperAdminOnly', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it("super admin — kontent ko'rinadi", () => {
    signIn('SUPER_ADMIN');
    render(<SuperAdminOnly>Adminlar jadvali</SuperAdminOnly>);
    expect(screen.getByText('Adminlar jadvali')).toBeInTheDocument();
  });

  it('oddiy admin — "Ruxsat yo\'q" (403), kontent chizilmaydi', () => {
    signIn('ADMIN');
    render(<SuperAdminOnly>Adminlar jadvali</SuperAdminOnly>);
    expect(screen.getByText("Ruxsat yo'q")).toBeInTheDocument();
    expect(screen.queryByText('Adminlar jadvali')).not.toBeInTheDocument();
  });
});
