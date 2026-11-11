'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { addGroupMembersSchema } from '@lms/shared';
import type { AddGroupMembersRequest } from '@lms/shared';

import type { ComboboxOption } from '@/components/ui';

import { addMembersErrorText } from '../lib/group-errors';

import { useAddGroupMembers } from './useGroupMutations';

const EMPTY_MEMBERS: AddGroupMembersRequest = { studentIds: [] };

/**
 * "Student qo'shish" formasi: tanlangan variantlar (nomlari bilan — xato matni uchun) va
 * `studentIds` (`addGroupMembersSchema`). Server xatosi Combobox maydoni ostiga tushadi.
 */
export function useAddMembersForm(groupId: string) {
  const [selected, setSelected] = useState<ComboboxOption[]>([]);
  const add = useAddGroupMembers(groupId);
  const form = useForm<AddGroupMembersRequest>({
    resolver: zodResolver(addGroupMembersSchema),
    defaultValues: EMPTY_MEMBERS,
  });

  const select = (options: ComboboxOption[]) => {
    setSelected(options);
    const studentIds = options.map((option) => option.value);
    form.setValue('studentIds', studentIds, { shouldValidate: form.formState.isSubmitted });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      await add.mutateAsync(values);
      setSelected([]);
      form.reset(EMPTY_MEMBERS);
    } catch (error) {
      form.setError('studentIds', {
        type: 'server',
        message: addMembersErrorText(error, selected),
      });
    }
  });

  return { form, selected, select, submit };
}
