import { Suspense } from 'react';

import { GroupsPage } from '@/features/admin-groups';

/** Guruhlar (SA, A) — docs/03 §4. Jadval holati URL query'da (`useSearchParams` → Suspense). */
export default function Page() {
  return (
    <Suspense>
      <GroupsPage />
    </Suspense>
  );
}
