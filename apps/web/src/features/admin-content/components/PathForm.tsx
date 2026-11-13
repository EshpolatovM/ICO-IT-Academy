'use client';

import { FormTextField } from '@/features/auth';

import { useContentForm } from '../hooks/useContentForm';
import { pathFormSchema } from '../schemas/content-forms.schemas';

import { ContentFormShell } from './ContentFormShell';
import { OptionalTextField } from './OptionalTextField';

import type { PathFormInput, PathFormValues } from '../schemas/content-forms.schemas';

/** Server maydon nomlari forma maydonlari bilan bir xil (409 `details.field = slug`). */
const PATH_SERVER_FIELDS = { title: 'title', slug: 'slug', description: 'description' } as const;

export const EMPTY_PATH_FORM: PathFormInput = { title: '', slug: '', description: '' };

export interface PathFormProps {
  defaultValues: PathFormInput;
  submitLabel: string;
  onValid: (values: PathFormValues) => Promise<unknown>;
  onCancel: () => void;
}

/** Yo'l formasi (yaratish va tahrirlash): nom, slug, tavsif. */
export function PathForm({ defaultValues, submitLabel, onValid, onCancel }: PathFormProps) {
  const { form, errors, shell } = useContentForm({
    schema: pathFormSchema,
    defaultValues,
    serverFields: PATH_SERVER_FIELDS,
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
      <FormTextField
        label="Slug"
        hint="URL uchun qisqa nom, masalan: frontend-asoslari"
        registration={form.register('slug')}
        error={errors.slug?.message}
      />
      <OptionalTextField
        label="Tavsif"
        multiline
        registration={form.register('description')}
        error={errors.description?.message}
      />
    </ContentFormShell>
  );
}
