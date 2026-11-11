'use client';

import { useState } from 'react';

import type { AdminGroupDetail } from '@lms/shared';

import { Alert, Button, Card, CardContent, CardHeader, CardTitle, Stack } from '@/components/ui';
import { FormRootError, FormTextField } from '@/features/auth';

import { useGroupForm } from '../hooks/useGroupForm';
import { useUpdateGroup } from '../hooks/useGroupMutations';
import {
  EDIT_GROUP_SERVER_FIELDS,
  editGroupDefaults,
  editGroupFormSchema,
} from '../lib/group-forms';

import { DateTextField } from './DateTextField';

/** Tahrirlash: nom va boshlanish sanasi (`PATCH /admin/groups/:id`). */
export function GroupEditCard({ group }: { group: AdminGroupDetail }) {
  const [saved, setSaved] = useState(false);
  const update = useUpdateGroup(group.id);
  const { form, submit } = useGroupForm({
    schema: editGroupFormSchema,
    defaultValues: editGroupDefaults(group),
    serverFields: EDIT_GROUP_SERVER_FIELDS,
    onValid: async (values) => {
      setSaved(false);
      const next = await update.mutateAsync(values);
      form.reset(editGroupDefaults(next));
      setSaved(true);
    },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tahrirlash</CardTitle>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={(event) => void submit(event)}>
          <Stack gap="4">
            <FormTextField
              label="Nom"
              registration={form.register('name')}
              error={errors.name?.message}
            />
            <DateTextField
              label="Boshlanish sanasi"
              registration={form.register('startsAt')}
              error={errors.startsAt?.message}
            />
            <FormRootError message={errors.root?.server?.message} />
            {saved ? <Alert variant="success">Saqlandi</Alert> : null}
            <Stack direction="horizontal" justify="end">
              <Button type="submit" loading={isSubmitting}>
                Saqlash
              </Button>
            </Stack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
