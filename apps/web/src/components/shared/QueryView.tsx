'use client';

import { Spinner } from '@/components/ui';

import { QueryLoadError } from './QueryLoadError';

import type { QueryLoadErrorProps } from './QueryLoadError';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface QueryViewProps<TData> extends Pick<QueryLoadErrorProps, 'notFoundTitle' | 'back'> {
  query: UseQueryResult<TData>;
  /** Ma'lumot kelganda chiziladigan mazmun. */
  children: (data: TData) => ReactNode;
}

/** So'rov holatlari: yuklanmoqda — spinner, xato — `QueryLoadError` (qayta urinish bilan), aks holda mazmun. */
export function QueryView<TData>({ query, children, ...errorProps }: QueryViewProps<TData>) {
  if (query.isPending) {
    return <Spinner />;
  }
  if (query.isError) {
    return (
      <QueryLoadError {...errorProps} error={query.error} onRetry={() => void query.refetch()} />
    );
  }
  return children(query.data);
}
