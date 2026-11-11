import { Alert, Button, Container, Stack } from '@/components/ui';

export interface SessionUnavailableProps {
  /** "Qayta urinish" — sessiyani tekshirishni qaytadan boshlaydi. */
  onRetry: () => void;
}

const UNAVAILABLE_TITLE = "Server bilan aloqa yo'q";
const UNAVAILABLE_MESSAGE =
  "Sessiyani tekshirib bo'lmadi. Internet aloqasini tekshirib, qayta urinib ko'ring.";

/**
 * Sessiyani tekshirishda vaqtinchalik xato (tarmoq, 5xx) bo'lganda butun sahifa o'rnida: sessiya
 * rad etilmagan, shuning uchun login sahifasiga yo'naltirilmaydi (M6).
 */
export function SessionUnavailable({ onRetry }: SessionUnavailableProps) {
  return (
    <Stack justify="center" className="min-h-screen" data-testid="session-unavailable">
      <Container size="sm">
        <Stack gap="4">
          <Alert variant="danger" title={UNAVAILABLE_TITLE}>
            {UNAVAILABLE_MESSAGE}
          </Alert>
          <Button type="button" variant="secondary" onClick={onRetry}>
            Qayta urinish
          </Button>
        </Stack>
      </Container>
    </Stack>
  );
}
