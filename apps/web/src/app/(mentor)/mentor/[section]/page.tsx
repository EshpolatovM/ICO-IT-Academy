import { notFound } from 'next/navigation';

import { findSectionEntry, MENTOR_NAV, SectionPage, sectionEntries } from '@/features/shell';

const BASE_PATH = '/mentor';

/** Faqat menyudagi bo'limlar; boshqa yo'llar — 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return sectionEntries(MENTOR_NAV, BASE_PATH, BASE_PATH).map(({ segments }) => ({
    section: segments.join('/'),
  }));
}

/** Mentor menyusidagi hali qilinmagan bo'limlar ("Tez orada"). */
export default async function MentorSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const entry = findSectionEntry(MENTOR_NAV, BASE_PATH, [section]);
  if (entry === undefined) {
    notFound();
  }
  return <SectionPage entry={entry} />;
}
