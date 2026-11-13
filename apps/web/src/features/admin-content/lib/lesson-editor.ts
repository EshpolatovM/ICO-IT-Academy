import type { LessonEditorInput } from '../schemas/content-forms.schemas';
import type { AdminLesson } from '../types/admin-content.types';

/** Server maydon nomlari forma maydonlari bilan bir xil (`PATCH /admin/lessons/:id`). */
export const LESSON_EDITOR_SERVER_FIELDS = {
  title: 'title',
  contentMd: 'contentMd',
  videoUrl: 'videoUrl',
  estMinutes: 'estMinutes',
  status: 'status',
} as const;

export function lessonEditorDefaults(lesson: AdminLesson): LessonEditorInput {
  return {
    title: lesson.title,
    contentMd: lesson.contentMd,
    videoUrl: lesson.videoUrl ?? '',
    estMinutes: lesson.estMinutes === null ? '' : String(lesson.estMinutes),
    status: lesson.status,
  };
}
