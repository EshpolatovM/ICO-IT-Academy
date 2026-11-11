import { Suspense } from 'react';

import { StudentsPage } from '@/features/admin-users';

/** Studentlar (SA, A) — docs/03 §4. Jadval holati URL query'da (`useSearchParams` → Suspense). */
export default function Page() {
  return (
    <Suspense>
      <StudentsPage />
    </Suspense>
  );
}
