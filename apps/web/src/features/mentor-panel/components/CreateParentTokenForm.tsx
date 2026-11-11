'use client';

import { PARENT_TOKEN_LABEL_MAX_LENGTH } from '@lms/shared';

import { Button, FormField, Input, Stack } from '@/components/ui';
import { FormRootError } from '@/features/auth';

import { emptyLabelToNull, useCreateParentTokenForm } from '../hooks/useCreateParentTokenForm';

import { ParentTokenResultDialog } from './ParentTokenResultDialog';

export interface CreateParentTokenFormProps {
  studentId: string;
  studentName: string;
}

/** Yangi ota-ona havolasi: ixtiyoriy yorliq ("Onasi") → havola va kod BIR MARTA ko'rinadi. */
export function CreateParentTokenForm({ studentId, studentName }: CreateParentTokenFormProps) {
  const { form, submit, created, clear } = useCreateParentTokenForm(studentId);
  const { errors, isSubmitting } = form.formState;

  return (
    <>
      <form noValidate onSubmit={(event) => void submit(event)}>
        <Stack gap="3">
          <FormField
            label="Yorliq (ixtiyoriy)"
            hint="Masalan: Onasi, Otasi."
            error={errors.label?.message}
          >
            {(control) => (
              <Input
                {...control}
                maxLength={PARENT_TOKEN_LABEL_MAX_LENGTH}
                {...form.register('label', { setValueAs: emptyLabelToNull })}
              />
            )}
          </FormField>
          <FormRootError message={errors.root?.server?.message} />
          <Stack direction="horizontal" justify="end">
            <Button type="submit" loading={isSubmitting}>
              Havola yaratish
            </Button>
          </Stack>
        </Stack>
      </form>
      {created !== null ? (
        <ParentTokenResultDialog
          title="Ota-ona havolasi yaratildi"
          studentName={studentName}
          token={created}
          onDone={clear}
        />
      ) : null}
    </>
  );
}
