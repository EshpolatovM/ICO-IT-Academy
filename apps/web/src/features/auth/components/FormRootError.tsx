import { Alert } from '@/components/ui';

/** Formaning umumiy server xatosi (401 umumiy xabar, 429, tarmoq ...). */
export function FormRootError({ message }: { message: string | undefined }) {
  if (message === undefined || message === '') {
    return null;
  }
  return <Alert variant="danger">{message}</Alert>;
}
