'use client';

import { QueryView } from '@/components/shared';
import { PageHeader, Stack } from '@/components/ui';

import { useAdminLesson } from '../hooks/useAdminContentQueries';
import { ADMIN_PATHS_HOME, pathTreePath } from '../lib/admin-content-paths';

import { ContentStatusBadge } from './ContentStatusBadge';
import { LessonEditorForm } from './LessonEditorForm';

const PATHS_BACK = { href: ADMIN_PATHS_HOME, label: "Ilm yo'llari" };

/** `/admin/lessons/:id` — dars muharriri: Markdown + preview, video havola, holat (SA, A). */
export function LessonEditorPage({ lessonId }: { lessonId: string }) {
  const lesson = useAdminLesson(lessonId);
  return (
    <QueryView query={lesson} back={PATHS_BACK} notFoundTitle="Dars topilmadi">
      {(data) => (
        <Stack gap="6">
          <PageHeader
            back={{ href: pathTreePath(data.path.id), label: data.path.title }}
            title={data.title}
            titleAddon={<ContentStatusBadge status={data.status} />}
            description={`Mavzu: ${data.topic.title}`}
          />
          <LessonEditorForm key={data.id} lesson={data} />
        </Stack>
      )}
    </QueryView>
  );
}
