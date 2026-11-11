import { notFound } from 'next/navigation';

import { ADMIN_NAV, findSectionEntry, SectionPage, sectionEntries } from '@/features/shell';

const BASE_PATH = '/admin';

/** O'z route'i bor (qilingan) bo'limlar — catch-all ularni yaratmaydi. */
const IMPLEMENTED_SECTIONS: ReadonlySet<string> = new Set(['students', 'admins', 'groups']);

/** Faqat menyudagi bo'limlar (`/admin/settings/rewards` kabi ko'p segmentli ham); boshqalari — 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return sectionEntries(ADMIN_NAV, BASE_PATH, BASE_PATH)
    .filter(({ segments }) => !IMPLEMENTED_SECTIONS.has(segments.join('/')))
    .map(({ segments }) => ({ section: segments }));
}

/** Admin menyusidagi hali qilinmagan bo'limlar ("Tez orada"; super admin bandlari — 403 holati). */
export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  const { section } = await params;
  const entry = findSectionEntry(ADMIN_NAV, BASE_PATH, section);
  if (entry === undefined) {
    notFound();
  }
  return <SectionPage entry={entry} />;
}
