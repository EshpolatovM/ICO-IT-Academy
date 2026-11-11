import { GroupDetailPage } from '@/features/admin-groups';

/** Guruh tafsiloti: mentor, a'zolar, tahrirlash, arxivlash (SA, A) — docs/03 §4. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupDetailPage id={id} />;
}
