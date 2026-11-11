import { ParentChildOverview } from '@/features/parent-access';

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <ParentChildOverview studentId={studentId} />;
}
