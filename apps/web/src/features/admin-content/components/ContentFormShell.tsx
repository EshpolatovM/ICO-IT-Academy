import { Button, Stack } from '@/components/ui';
import { FormRootError } from '@/features/auth';

import type { BaseSyntheticEvent, ReactNode } from 'react';
import type { FieldValues, FormState } from 'react-hook-form';

export interface ContentFormShellProps<T extends FieldValues> {
  /** `useApiForm` dagi `submit`. */
  submit: (event?: BaseSyntheticEvent) => Promise<void>;
  formState: FormState<T>;
  submitLabel: string;
  onCancel: () => void;
  /** Forma maydonlari. */
  children: ReactNode;
}

/** Forma oynasi qobig'i: maydonlar, umumiy server xatosi, "Bekor qilish" va yuborish tugmalari. */
export function ContentFormShell<T extends FieldValues>({
  submit,
  formState,
  submitLabel,
  onCancel,
  children,
}: ContentFormShellProps<T>) {
  const submitting = formState.isSubmitting;
  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <Stack gap="4">
        {children}
        <FormRootError message={formState.errors.root?.server?.message} />
        <Stack direction="horizontal" gap="2" justify="end">
          <Button variant="secondary" disabled={submitting} onClick={onCancel}>
            Bekor qilish
          </Button>
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
