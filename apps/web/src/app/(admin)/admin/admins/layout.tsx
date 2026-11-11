import { SuperAdminOnly } from '@/features/shell';

import type { ReactNode } from 'react';

/** Adminlar bo'limi faqat super admin uchun (docs/03 §4.1): oddiy admin — "Ruxsat yo'q" (403). */
export default function Layout({ children }: { children: ReactNode }) {
  return <SuperAdminOnly>{children}</SuperAdminOnly>;
}
