'use client';

import { ContentStatus } from '@lms/shared';

import { FormTextField } from '@/features/auth';

import { useContentForm } from '../hooks/useContentForm';
import { CONTENT_STATUS_OPTIONS } from '../lib/content-status';
import { nodeFormSchema } from '../schemas/content-forms.schemas';

import { ContentFormShell } from './ContentFormShell';
import { OptionalTextField } from './OptionalTextField';
import { SelectField } from './SelectField';

import type { NodeFormInput, NodeFormValues } from '../schemas/content-forms.schemas';
import type { UseFormReturn } from 'react-hook-form';

const NODE_SERVER_FIELDS = {
  title: 'title',
  description: 'description',
  icon: 'icon',
  status: 'status',
} as const;

export const EMPTY_NODE_FORM: NodeFormInput = {
  title: '',
  description: '',
  icon: '',
  status: ContentStatus.DRAFT,
};

export interface NodeFormProps {
  defaultValues: NodeFormInput;
  submitLabel: string;
  /** Mavzu formasi — "Ikonka" maydoni bilan. */
  withIcon: boolean;
  /** Tahrirlash — "Holat" maydoni bilan. */
  withStatus: boolean;
  onValid: (values: NodeFormValues) => Promise<unknown>;
  onCancel: () => void;
}

interface NodeExtraFieldsProps extends Pick<NodeFormProps, 'withIcon' | 'withStatus'> {
  form: UseFormReturn<NodeFormInput, unknown, NodeFormValues>;
}

/** Mavzu ikonkasi va (tahrirlashda) holat maydonlari. */
function NodeExtraFields({ form, withIcon, withStatus }: NodeExtraFieldsProps) {
  const { errors } = form.formState;
  return (
    <>
      {withIcon ? (
        <OptionalTextField
          label="Ikonka"
          registration={form.register('icon')}
          error={errors.icon?.message}
        />
      ) : null}
      {withStatus ? (
        <SelectField
          label="Holat"
          options={CONTENT_STATUS_OPTIONS}
          registration={form.register('status')}
          error={errors.status?.message}
        />
      ) : null}
    </>
  );
}

/** Bo'lim / mavzu formasi: nom, tavsif, (mavzu) ikonka, (tahrirlash) holat. */
export function NodeForm({
  defaultValues,
  submitLabel,
  withIcon,
  withStatus,
  onValid,
  onCancel,
}: NodeFormProps) {
  const { form, errors, shell } = useContentForm({
    schema: nodeFormSchema,
    defaultValues,
    serverFields: NODE_SERVER_FIELDS,
    onValid,
    submitLabel,
    onCancel,
  });

  return (
    <ContentFormShell {...shell}>
      <FormTextField
        label="Nom"
        registration={form.register('title')}
        error={errors.title?.message}
      />
      <OptionalTextField
        label="Tavsif"
        multiline
        registration={form.register('description')}
        error={errors.description?.message}
      />
      <NodeExtraFields form={form} withIcon={withIcon} withStatus={withStatus} />
    </ContentFormShell>
  );
}
