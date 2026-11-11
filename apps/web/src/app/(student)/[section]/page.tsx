import { notFound } from 'next/navigation';

import { findSectionEntry, SectionPage, sectionEntries, STUDENT_NAV } from '@/features/shell';

const BASE_PATH = '/';
const HOME_PATH = '/path';

/** Faqat menyudagi bo'limlar; boshqa yo'llar — 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return sectionEntries(STUDENT_NAV, BASE_PATH, HOME_PATH).map(({ segments }) => ({
    section: segments.join('/'),
  }));
}

/** Student menyusidagi hali qilinmagan bo'limlar ("Tez orada"). */
export default async function StudentSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const entry = findSectionEntry(STUDENT_NAV, BASE_PATH, [section]);
  if (entry === undefined) {
    notFound();
  }
  return <SectionPage entry={entry} />;
}
