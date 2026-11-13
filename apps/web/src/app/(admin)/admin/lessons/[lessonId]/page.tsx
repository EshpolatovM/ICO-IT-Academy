import { LessonEditorPage } from '@/features/admin-content';

/** Dars muharriri: Markdown + preview, video havola (SA, A) — docs/03 §4. */
export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonEditorPage lessonId={lessonId} />;
}
