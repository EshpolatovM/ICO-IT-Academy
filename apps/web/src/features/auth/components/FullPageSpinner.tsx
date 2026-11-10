import { Spinner, Stack } from '@/components/ui';

/** Sessiya tiklanayotganda yoki yo'naltirish paytida butun sahifa o'rnida yuklanish belgisi. */
export function FullPageSpinner({ label }: { label?: string }) {
  return (
    <Stack align="center" justify="center" className="min-h-screen" data-testid="full-page-spinner">
      <Spinner label={label} />
    </Stack>
  );
}
