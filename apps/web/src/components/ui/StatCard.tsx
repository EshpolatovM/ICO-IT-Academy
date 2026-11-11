import { cn } from '@/lib/cn';

import { Card } from './Card';
import { isPresentNode } from './isPresentNode';
import { Spinner } from './Spinner';

import type { ReactNode } from 'react';

export interface StatCardProps {
  /** Ko'rsatkich nomi ("Studentlar soni"). */
  label: string;
  /** Asosiy qiymat (raqam yoki qisqa matn). */
  value: ReactNode;
  /** Qiymat ostidagi izoh ("o'tgan haftaga nisbatan +3"). */
  hint?: ReactNode;
  /** Qiymat hali yuklanmoqda: raqam o'rnida spinner. */
  loading?: boolean;
  className?: string;
}

/** Dashboard / guruh tafsiloti uchun oddiy "nom — katta raqam — izoh" kartasi. */
export function StatCard({ label, value, hint, loading = false, className }: StatCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <dl className="flex flex-col gap-1">
        <dt className="text-sm text-text-muted">{label}</dt>
        <dd className="text-3xl font-semibold text-text">
          {loading ? <Spinner size="md" label={`${label}: yuklanmoqda`} /> : value}
        </dd>
        {isPresentNode(hint) ? <dd className="text-xs text-text-muted">{hint}</dd> : null}
      </dl>
    </Card>
  );
}
