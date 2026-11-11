import { Alert, Button, Stack } from '@/components/ui';

import { errorText } from '../lib/group-errors';

/** Yuklash xatosi: xabar va "Qayta urinish". */
export function GroupQueryError({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <Alert variant="danger" title="Ma'lumotni yuklab bo'lmadi">
      <Stack gap="2" align="start">
        <span>{errorText(error)}</span>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Qayta urinish
        </Button>
      </Stack>
    </Alert>
  );
}
