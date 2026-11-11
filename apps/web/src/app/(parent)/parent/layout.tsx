import { ParentLayout } from '@/features/shell';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Ota-ona paneli — ICO IT Academy',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <ParentLayout>{children}</ParentLayout>;
}
