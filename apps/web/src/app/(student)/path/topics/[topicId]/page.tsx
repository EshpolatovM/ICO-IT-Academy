import { TopicPage } from '@/features/learning-path';

/** Mavzu va uning darslari (docs/03 §2.2). */
export default async function Page({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  return <TopicPage key={topicId} topicId={topicId} />;
}
