import { LessonPage } from '@/features/learning-path';

/** Dars sahifasi (docs/03 §2.2). `key` — boshqa darsga o'tganda holat (auto-start, complete) tozalanadi. */
export default async function Page({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LessonPage key={lessonId} lessonId={lessonId} />;
}
