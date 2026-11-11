'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ManagedUserBase } from '@lms/shared';

import { adminUsersKeys } from '../api/admin-users.query-keys';

import type { ManagedUserKind } from '../types/admin-users.types';

export interface UpdateUserVariables<TBody> {
  id: string;
  body: TBody;
}

/** `PATCH` (tahrirlash, deaktivatsiya/aktivatsiya): javob tafsilot keshiga, ro'yxatlar — qayta yuklanadi. */
export function useUpdateUser<T extends ManagedUserBase, TBody>(
  kind: ManagedUserKind,
  update: (id: string, body: TBody) => Promise<T>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: UpdateUserVariables<TBody>) => update(id, body),
    onSuccess: (user) => {
      queryClient.setQueryData(adminUsersKeys.detail(kind, user.id), user);
      void queryClient.invalidateQueries({ queryKey: [...adminUsersKeys.kind(kind), 'list'] });
    },
  });
}
