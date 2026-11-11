'use client';

import { useState } from 'react';

import type { CreatedUserResponse } from '@lms/shared';

import { SecretResultContent, temporaryPasswordSecrets } from '@/components/shared';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import type { DescriptionItem } from '@/components/ui';
import type { ServerFieldMap } from '@/lib/forms';
import { useSecretMutation } from '@/lib/hooks';

import { adminUsersKeys } from '../api/admin-users.query-keys';

import { UserForm } from './UserForm';

import type { UserFieldConfig } from '../lib/user-fields';
import type { ManagedUserKind } from '../types/admin-users.types';
import type { DefaultValues, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

export interface CreateUserDialogProps<
  TInput extends FieldValues,
  TOutput,
  TResult extends CreatedUserResponse,
> {
  kind: ManagedUserKind;
  triggerLabel: string;
  title: string;
  schema: z.ZodType<TOutput, TInput>;
  defaultValues: DefaultValues<TInput>;
  fields: readonly UserFieldConfig<TInput>[];
  serverFields: ServerFieldMap<TInput>;
  create: (values: TOutput) => Promise<TResult>;
  /** Natija oynasidagi login ma'lumotlari (ID yoki telefon, ism). */
  describe: (result: TResult, values: TOutput) => DescriptionItem[];
}

interface CreatedState<TOutput, TResult> {
  values: TOutput;
  result: TResult;
}

/** Oyna holati: ochiq/yopiq va yaratilgan akkaunt (yopilganda xotiradan o'chiriladi). */
function useCreateUserDialog<TOutput, TResult>(
  kind: ManagedUserKind,
  create: (values: TOutput) => Promise<TResult>,
) {
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<CreatedState<TOutput, TResult> | null>(null);
  const { run, clear } = useSecretMutation(create, adminUsersKeys.kind(kind));

  const changeOpen = (next: boolean) => {
    clear();
    setCreated(null);
    setOpen(next);
  };

  const submit = async (values: TOutput) => {
    const result = await run(values);
    setCreated({ values, result });
  };

  const close = () => {
    changeOpen(false);
  };

  return { open, changeOpen, close, created, submit };
}

/**
 * Yaratish oynasi: forma → muvaffaqiyatda login ma'lumotlari va vaqtinchalik parol (BIR MARTA).
 * Natija faqat shu komponent holatida; oyna yopilganda o'chiriladi.
 */
export function CreateUserDialog<
  TInput extends FieldValues,
  TOutput,
  TResult extends CreatedUserResponse,
>({
  kind,
  triggerLabel,
  title,
  create,
  describe,
  ...formProps
}: CreateUserDialogProps<TInput, TOutput, TResult>) {
  const { open, changeOpen, close, created, submit } = useCreateUserDialog(kind, create);

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{created === null ? title : 'Akkaunt yaratildi'}</DialogTitle>
        </DialogHeader>
        {created === null ? (
          <UserForm {...formProps} submitLabel="Yaratish" onCancel={close} onValid={submit} />
        ) : (
          <SecretResultContent
            items={describe(created.result, created.values)}
            secrets={temporaryPasswordSecrets(created.result.temporaryPassword)}
            onDone={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
