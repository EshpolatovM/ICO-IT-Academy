import { PathTreePage } from '@/features/admin-content';

/** Yo'l daraxti muharriri: bo'lim → mavzu → dars, sandiqlar (SA, A) — docs/03 §4. */
export default async function Page({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params;
  return <PathTreePage pathId={pathId} />;
}
