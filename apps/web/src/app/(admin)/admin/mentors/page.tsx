import { Suspense } from 'react';

import { MentorsPage } from '@/features/admin-users';

/** Mentorlar (SA, A) — docs/03 §4. Jadval holati URL query'da (`useSearchParams` → Suspense). */
export default function Page() {
  return (
    <Suspense>
      <MentorsPage />
    </Suspense>
  );
}
