'use client';

import { useState } from 'react';

import { Alert, Button, Stack } from '@/components/ui';
import { FormRootError, FormTextField } from '@/features/auth';
import { useApiForm } from '@/lib/forms';

import { useUpdateLesson } from '../hooks/useNodeMutations';
import { CONTENT_STATUS_OPTIONS } from '../lib/content-status';
import { LESSON_EDITOR_SERVER_FIELDS, lessonEditorDefaults } from '../lib/lesson-editor';
import { lessonEditorFormSchema } from '../schemas/content-forms.schemas';

import { LessonContentTabs } from './LessonContentTabs';
import { OptionalTextField } from './OptionalTextField';
import { SelectField } from './SelectField';

import type { LessonEditorInput, LessonEditorValues } from '../schemas/content-forms.schemas';
import type { AdminLesson } from '../types/admin-content.types';
import type { UseFormReturn } from 'react-hook-form';

type LessonEditorForm = UseFormReturn<LessonEditorInput, unknown, LessonEditorValues>;

function LessonMetaFields({ form }: { form: LessonEditorForm }) {
  const { errors } = form.formState;
  return (
    <>
      <FormTextField
        label="Sarlavha"
        registration={form.register('title')}
        error={errors.title?.message}
      />
      <OptionalTextField
        label="Video havola"
        hint="Ixtiyoriy, faqat https://"
        inputMode="url"
        registration={form.register('videoUrl')}
        error={errors.videoUrl?.message}
      />
      <OptionalTextField
        label="Taxminiy vaqt (daqiqa)"
        inputMode="numeric"
        registration={form.register('estMinutes')}
        error={errors.estMinutes?.message}
      />
      <SelectField
        label="Holat"
        options={CONTENT_STATUS_OPTIONS}
        registration={form.register('status')}
        error={errors.status?.message}
      />
    </>
  );
}

/** Dars muharriri formasi: barcha maydonlar bitta `PATCH` bilan saqlanadi. */
export function LessonEditorForm({ lesson }: { lesson: AdminLesson }) {
  const update = useUpdateLesson(lesson.id);
  const [saved, setSaved] = useState(false);
  const { form, submit } = useApiForm({
    schema: lessonEditorFormSchema,
    defaultValues: lessonEditorDefaults(lesson),
    serverFields: LESSON_EDITOR_SERVER_FIELDS,
    onValid: async (values) => {
      setSaved(false);
      await update.mutateAsync(values);
      setSaved(true);
    },
  });
  const { errors, isSubmitting } = form.formState;

  return (
    <form noValidate onSubmit={(event) => void submit(event)}>
      <Stack gap="4">
        <LessonMetaFields form={form} />
        <LessonContentTabs
          registration={form.register('contentMd')}
          source={form.watch('contentMd')}
          error={errors.contentMd?.message}
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
  );
}
