'use client';

import { useState } from 'react';

import { Button, FormField, Stack } from '@/components/ui';
import type { ComboboxOption } from '@/components/ui';
import { FormRootError, FormTextField } from '@/features/auth';

import { useGroupForm } from '../hooks/useGroupForm';
import {
  CREATE_GROUP_SERVER_FIELDS,
  createGroupFormSchema,
  EMPTY_CREATE_GROUP_FORM,
} from '../lib/group-forms';

import { DateTextField } from './DateTextField';
import { MentorCombobox } from './MentorCombobox';
import { PathSelect } from './PathSelect';

import type { CreateGroupFormValues } from '../lib/group-forms';

export interface CreateGroupFormProps {
  onValid: (values: CreateGroupFormValues) => Promise<unknown>;
  onCancel: () => void;
}

function FormActions({ onCancel, submitting }: { onCancel: () => void; submitting: boolean }) {
  return (
    <Stack direction="horizontal" gap="2" justify="end">
      <Button variant="secondary" onClick={onCancel} disabled={submitting}>
        Bekor qilish
      </Button>
      <Button type="submit" loading={submitting}>
        Yaratish
      </Button>
    </Stack>
  );
}

/** "Yangi guruh": nom, yo'l, ixtiyoriy mentor va boshlanish sanasi (`createGroupSchema`). */
export function CreateGroupForm({ onValid, onCancel }: CreateGroupFormProps) {
  const [mentor, setMentor] = useState<ComboboxOption | null>(null);
  const { form, submit } = useGroupForm({
    schema: createGroupFormSchema,
    defaultValues: EMPTY_CREATE_GROUP_FORM,
    serverFields: CREATE_GROUP_SERVER_FIELDS,
    onValid,
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <Stack gap="4">
        <FormTextField
          label="Nom"
          registration={form.register('name')}
          error={errors.name?.message}
        />
        <FormField label="Yo'l" required error={errors.pathId?.message}>
          {(control) => (
            <PathSelect
              control={control}
              placeholder="Yo'lni tanlang"
              {...form.register('pathId')}
            />
          )}
        </FormField>
        <FormField label="Mentor" error={errors.mentorId?.message}>
          {(control) => (
            <MentorCombobox
              control={control}
              value={mentor}
              onChange={(option) => {
                setMentor(option);
                form.setValue('mentorId', option?.value ?? null);
              }}
            />
          )}
        </FormField>
        <DateTextField
          label="Boshlanish sanasi"
          registration={form.register('startsAt')}
          error={errors.startsAt?.message}
        />
        <FormRootError message={errors.root?.server?.message} />
        <FormActions onCancel={onCancel} submitting={isSubmitting} />
      </Stack>
    </form>
  );
}
