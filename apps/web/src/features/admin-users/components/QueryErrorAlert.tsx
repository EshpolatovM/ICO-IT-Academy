import { Alert, Button, Stack } from '@/components/ui';
import { isApiError, UNKNOWN_ERROR_MESSAGE } from '@/lib/api';

/** Xato matni: API xabari yoki umumiy matn. */
export function errorMessage(error: unknown): string {
  return isApiError(error) ? error.message : UNKNOWN_ERROR_MESSAGE;
}

export interface QueryErrorAlertProps {
  error: unknown;
  onRetry?: () => void;
}

/** So'rov xatosi: xabar + (berilsa) "Qayta urinish". */
export function QueryErrorAlert({ error, onRetry }: QueryErrorAlertProps) {
  return (
    <Alert variant="danger" title="Ma'lumotni yuklab bo'lmadi">
      <Stack gap="2" align="start">
        <span>{errorMessage(error)}</span>
        {onRetry !== undefined ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Qayta urinish
          </Button>
        ) : null}
      </Stack>
    </Alert>
  );
}
