import { AdminLayout } from '@/features/shell';

import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
