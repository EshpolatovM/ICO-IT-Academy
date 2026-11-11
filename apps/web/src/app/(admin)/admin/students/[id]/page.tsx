import { StudentDetailPage } from '@/features/admin-users';

/** Student tafsiloti va tahrirlash (SA, A) — docs/03 §4. */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentDetailPage id={id} />;
}
