'use client';

import { GROUP_MEMBERS_ADD_MAX, GroupStatus } from '@lms/shared';
import type { AdminGroupDetail } from '@lms/shared';

import { Button, FormField, Stack } from '@/components/ui';

import { useAddMembersForm } from '../hooks/useAddMembersForm';
import { GROUP_ARCHIVED_MESSAGE } from '../lib/group-errors';

import { StudentsCombobox } from './StudentsCombobox';

const ADD_HINT = `Bir martada ko'pi bilan ${String(GROUP_MEMBERS_ADD_MAX)} ta student.`;

/** "Student qo'shish": bir nechta faol student; arxivlangan guruhda — disabled. */
export function AddMembersForm({ group }: { group: AdminGroupDetail }) {
  const { form, selected, select, submit } = useAddMembersForm(group.id);
  const { errors, isSubmitting } = form.formState;
  const archived = group.status === GroupStatus.ARCHIVED;

  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <Stack gap="3">
        <FormField
          label="Student qo'shish"
          hint={archived ? GROUP_ARCHIVED_MESSAGE : ADD_HINT}
          error={errors.studentIds?.message}
        >
          {(control) => (
            <StudentsCombobox
              groupId={group.id}
              control={control}
              value={selected}
              onChange={select}
              disabled={archived || isSubmitting}
            />
          )}
        </FormField>
        <Stack direction="horizontal" justify="end">
          <Button type="submit" loading={isSubmitting} disabled={archived || selected.length === 0}>
            Qo&apos;shish
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
