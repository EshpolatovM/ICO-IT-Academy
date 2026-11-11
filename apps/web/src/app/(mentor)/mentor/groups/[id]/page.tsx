import { MentorGroupDetailPage } from '@/features/mentor-panel';

/** Guruh tafsiloti va studentlar jadvali (M, faqat o'z guruhi) — docs/03 §3. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MentorGroupDetailPage id={id} />;
}
