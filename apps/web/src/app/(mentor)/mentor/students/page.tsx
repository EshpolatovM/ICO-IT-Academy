import { notFound } from 'next/navigation';

import { findSectionEntry, MENTOR_NAV, SectionPage } from '@/features/shell';

/**
 * `/mentor/students` — hali "Tez orada" (menyudagi band). `students/[id]` route'i bor, shuning
 * uchun bu yo'l catch-all `[section]` ga tushmaydi va alohida sahifa kerak.
 */
export default function MentorStudentsSectionPage() {
  const entry = findSectionEntry(MENTOR_NAV, '/mentor', ['students']);
  if (entry === undefined) {
    notFound();
  }
  return <SectionPage entry={entry} />;
}
