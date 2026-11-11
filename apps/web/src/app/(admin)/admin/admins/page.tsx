import { Suspense } from 'react';

import { AdminsPage } from '@/features/admin-users';

/** Adminlar (faqat SA) — docs/03 §4.1. Jadval holati URL query'da (`useSearchParams` → Suspense). */
export default function Page() {
  return (
    <Suspense>
      <AdminsPage />
    </Suspense>
  );
}
