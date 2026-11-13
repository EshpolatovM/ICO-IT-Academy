'use client';

import { FormTextField } from '@/features/auth';

import { useContentForm } from '../hooks/useContentForm';
import { useCreateLesson } from '../hooks/useNodeMutations';
import { lessonCreateFormSchema } from '../schemas/content-forms.schemas';

import { ContentFormDialog } from './ContentFormDialog';
import { ContentFormShell } from './ContentFormShell';

import type { AdminTopicNode } from '../types/admin-content.types';

const LESSON_CREATE_SERVER_FIELDS = { title: 'title' } as const;

interface LessonCreateFormProps {
  topicId: string;
  onDone: () => void;
}

/** Yangi dars: faqat sarlavha (matn, video — dars muharririda). */
function LessonCreateForm({ topicId, onDone }: LessonCreateFormProps) {
  const create = useCreateLesson(topicId);
  const { form, errors, shell } = useContentForm({
    schema: lessonCreateFormSchema,
    defaultValues: { title: '' },
    serverFields: LESSON_CREATE_SERVER_FIELDS,
    onValid: async (values) => {
      await create.mutateAsync(values);
      onDone();
    },
    submitLabel: "Qo'shish",
    onCancel: onDone,
  });
  return (
    <ContentFormShell {...shell}>
      <FormTextField
        label="Sarlavha"
        registration={form.register('title')}
        error={errors.title?.message}
      />
    </ContentFormShell>
  );
}

/** `POST /admin/topics/:id/lessons` (oxiriga, `DRAFT`). */
export function AddLessonDialog({ topic }: { topic: AdminTopicNode }) {
  return (
    <ContentFormDialog
      title={`Yangi dars: ${topic.title}`}
      triggerLabel="+ Dars"
      triggerAriaLabel={`Dars qo'shish: ${topic.title}`}
    >
      {(close) => <LessonCreateForm topicId={topic.id} onDone={close} />}
    </ContentFormDialog>
  );
}
