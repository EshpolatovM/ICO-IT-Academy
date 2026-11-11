import { ErrorCode } from '@lms/shared';

import { EmptyState, Stack, TextLink } from '@/components/ui';
import type { PageHeaderBackLink } from '@/components/ui';
import { isApiError } from '@/lib/api';

import { QueryErrorAlert } from './QueryErrorAlert';

const NOT_FOUND_DESCRIPTION = "U o'chirilgan, sizga tegishli emas yoki havola noto'g'ri.";

export interface QueryLoadErrorProps {
  error: unknown;
  /** Berilsa, 404 (`NOT_FOUND`) shu sarlavhali bo'sh holat bo'lib ko'rinadi ("Guruh topilmadi"). */
  notFoundTitle?: string;
  onRetry?: () => void;
  /** Xabar ustidagi "← orqaga" havola. */
  back?: PageHeaderBackLink;
}

function LoadErrorBody({ error, notFoundTitle, onRetry }: Omit<QueryLoadErrorProps, 'back'>) {
  const notFound = isApiError(error) && error.code === ErrorCode.NOT_FOUND;
  if (notFound && notFoundTitle !== undefined) {
    return <EmptyState title={notFoundTitle} description={NOT_FOUND_DESCRIPTION} />;
  }
  return <QueryErrorAlert error={error} onRetry={onRetry} />;
}

/** So'rov yuklanmadi: 404 — bo'sh holat (`notFoundTitle`), boshqa xato — xabar va "Qayta urinish". */
export function QueryLoadError({ back, ...body }: QueryLoadErrorProps) {
  if (back === undefined) {
    return <LoadErrorBody {...body} />;
  }
  return (
    <Stack gap="4">
      <TextLink href={back.href} variant="muted" className="self-start">
        ← {back.label}
      </TextLink>
      <LoadErrorBody {...body} />
    </Stack>
  );
}
