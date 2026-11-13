'use client';

import { ErrorCode } from '@lms/shared';

import { QueryView } from '@/components/shared';
import type { QueryViewProps } from '@/components/shared';
import { PageHeader } from '@/components/ui';
import type { PageHeaderBackLink } from '@/components/ui';
import { isApiError } from '@/lib/api';

const LOCKED_DESCRIPTION = 'Avvalgi mavzu yoki darsni tugatganingizdan keyin ochiladi.';

export interface LearningQueryViewProps<TData> extends QueryViewProps<TData> {
  back: PageHeaderBackLink;
  /** 403 `LOCKED` uchun sarlavha ("Mavzu hali qulflangan"). */
  lockedTitle: string;
}

/** `QueryView` + ilm yo'liga xos 403 `LOCKED` holati (404 — `notFoundTitle`). */
export function LearningQueryView<TData>({
  lockedTitle,
  back,
  ...rest
}: LearningQueryViewProps<TData>) {
  const { error } = rest.query;
  if (isApiError(error) && error.code === ErrorCode.LOCKED) {
    return <PageHeader back={back} title={lockedTitle} description={LOCKED_DESCRIPTION} />;
  }
  return <QueryView back={back} {...rest} />;
}
